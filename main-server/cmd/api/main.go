package main

import (
	"fmt"
	"os"

	"arias.systems.ice-wear-store/main-server/config"
	"arias.systems.ice-wear-store/main-server/helpers"
	"arias.systems.ice-wear-store/main-server/internal/controllers"
	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humafiber"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/static"
)

func main() {
	// Setup local file directory
	if err := os.MkdirAll(config.Envs.UploadDir, os.ModePerm); err != nil {
		panic(err)
	}

	// Setup main server
	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: config.Envs.CORSOrigins,
	}))
	app.Get("/images/*", static.New(config.Envs.UploadDir))
	api := humafiber.New(app, huma.DefaultConfig("Ice Wear Store API", "0.0.1"))

	helpers.InitDB(helpers.NewDBFromEnv())

	huma.Get(api, "/products", controllers.GetAllItems)
	huma.Get(api, "/products/id-list", controllers.GetItemsByIdList)
	huma.Get(api, "/products/{id}", controllers.GetItemById)
	huma.Post(api, "/chat", controllers.Chat)
	huma.Post(api, "/upload-image", controllers.UploadFile)

	app.Listen(fmt.Sprintf(":%s", config.Envs.Port))
}
