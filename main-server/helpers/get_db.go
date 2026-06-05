package helpers

import (
	"database/sql"
	"fmt"

	"arias.systems.ice-wear-store/main-server/config"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

var db *bun.DB

// InitDB sets the global DB instance. Call once at startup (or from tests
// with a testcontainer-backed instance built via GetDBFromDSN).
func InitDB(instance *bun.DB) {
	db = instance
}

// GetDB returns the global DB instance set by InitDB.
func GetDB() *bun.DB {
	if db == nil {
		panic("helpers.GetDB: db not initialized — call helpers.InitDB first")
	}
	return db
}

// NewDBFromEnv builds a *bun.DB from config.Envs. Typically passed to InitDB
// in main; tests should build their own via GetDBFromDSN instead.
func NewDBFromEnv() *bun.DB {
	password := config.Envs.DB.Password

	var dsn string
	if password == nil {
		dsn = fmt.Sprintf(
			"postgres://%s@%s:%s/%s?sslmode=disable",
			config.Envs.DB.User,
			config.Envs.DB.Host,
			config.Envs.DB.Port,
			config.Envs.DB.Name,
		)
	} else {
		dsn = fmt.Sprintf(
			"postgres://%s:%s@%s:%s/%s?sslmode=disable",
			config.Envs.DB.User,
			*password,
			config.Envs.DB.Host,
			config.Envs.DB.Port,
			config.Envs.DB.Name,
		)
	}

	return GetDBFromDSN(dsn)
}

func GetDBFromDSN(dsn string) *bun.DB {
	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))
	return bun.NewDB(sqldb, pgdialect.New())
}
