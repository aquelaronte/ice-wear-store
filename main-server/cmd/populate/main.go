package main

import (
	"bufio"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strconv"
	"sync"

	"arias.systems.ice-wear-store/main-server/helpers"
	"arias.systems.ice-wear-store/main-server/internal/entities"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type scrapedItem struct {
	Name        string   `json:"name"`
	Price       int      `json:"price"`
	Description *string  `json:"description"`
	Pictures    []string `json:"pictures"`
	Variants    []string `json:"variants"`
}

// This function will run scrapers to populate the DB
// scrapers yields the items via stdout, so this function
// will scan stdout and insert each entry to the database
func main() {
	limit := flag.Int("limit", 0, "max number of products to scrape per spider (0 = no limit)")
	flag.Parse()

	spiders := []string{"clemont", "undergold"}

	helpers.InitDB(helpers.NewDBFromEnv())
	db := helpers.GetDB()
	ctx := context.Background()

	// delete records from database before starting to populate
	if _, err := db.ExecContext(ctx, "TRUNCATE item, item_variant RESTART IDENTITY CASCADE"); err != nil {
		log.Fatalf("truncate tables: %v", err)
	}

	// we use a wait group since we run scrapers
	// asynchronously, so we have to wait for scrapers to finish
	var wg sync.WaitGroup

	for _, spider := range spiders {
		wg.Add(1)

		go func(spider string) {
			// free the wait group at the end
			defer wg.Done()

			// run scraping and inserting process
			n, err := populate(ctx, db, spider, *limit)

			if err != nil {
				log.Printf("[%s] failed: %v", spider, err)
				return
			}
			fmt.Printf("[%s] inserted %d items\n", spider, n)
		}(spider)
	}
	wg.Wait()
}

// runs a spider and begins to insert items in database
func populate(ctx context.Context, db *bun.DB, spider string, limit int) (int, error) {
	// -O = override output config
	// - = stdout
	// :jsonlines = format
	//
	// jsonlines: each line is a complete json
	// json: a well formatted json with indentation and new lines
	// csv: data in csv format
	args := []string{"run", "scrapy", "crawl", spider, "-O", "-:jsonlines"}

	// If limit is passed, then append it to the arguments
	if limit > 0 {
		args = append(args, "-a", "limit="+strconv.Itoa(limit))
	}
	cmd := exec.Command("uv", args...)

	// WARNING: this route is always relative from where we are running this script
	// ../web-scraper works if we run this script via `make populate` or `go run ./cmd/populate/main.go`
	// other commands for running this script will fail for this
	cmd.Dir = "../web-scraper"
	cmd.Stderr = os.Stderr

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return 0, fmt.Errorf("stdout pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return 0, fmt.Errorf("start scraper: %w", err)
	}

	scanner := bufio.NewScanner(stdout)
	scanner.Buffer(make([]byte, 0, 64*1024), 1<<20)

	// instance source type from enums
	source := entities.Source(spider)
	inserted := 0

	// iter over every line in stdout
	for scanner.Scan() {
		// serialize string to json struct
		var s scrapedItem
		if err := json.Unmarshal(scanner.Bytes(), &s); err != nil {
			log.Printf("[%s] skip bad line: %v", spider, err)
			continue
		}

		// IMPORTANT: using v7 is important since uuid.New() will generate a v4 uuid
		// that will shake the entire b-tree on every insert
		id, err := uuid.NewV7()
		if err != nil {
			log.Printf("[%s] uuid v7: %v", spider, err)
			continue
		}

		// insert item
		item := entities.Item{
			ID:          id,
			Name:        s.Name,
			Description: s.Description,
			Price:       s.Price,
			Pictures:    s.Pictures,
			Source:      source,
		}

		if _, err := db.NewInsert().Model(&item).Exec(ctx); err != nil {
			log.Printf("[%s] insert item %q: %v", spider, s.Name, err)
			continue
		}

		// If this has variants
		if len(s.Variants) > 0 {
			variants := make([]entities.ItemVariant, len(s.Variants))
			for i, v := range s.Variants {
				id, err := uuid.NewV7()
				if err != nil {
					log.Printf("[%s] uuid v7: %v", spider, err)
					continue
				}

				variants[i] = entities.ItemVariant{
					ID:     id,
					ItemID: item.ID,
					Name:   v,
				}
			}

			// call a single insert with all the variants
			if _, err := db.NewInsert().Model(&variants).Exec(ctx); err != nil {
				log.Printf("[%s] insert variants for %q: %v", spider, s.Name, err)
			}
		}

		inserted++
	}

	if err := scanner.Err(); err != nil {
		log.Printf("[%s] scanner error: %v", spider, err)
	}

	if err := cmd.Wait(); err != nil {
		return inserted, fmt.Errorf("scraper exited: %w", err)
	}
	return inserted, nil
}
