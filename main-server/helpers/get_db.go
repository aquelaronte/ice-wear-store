package helpers

import (
	"database/sql"
	"fmt"

	"arias.systems.ice-wear-store/main-server/config"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

func GetDB() *bun.DB {
	password := config.Envs.DB.Password

	var dsn string

	// If password is not set, omit it from the DSN
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
	// Open a sql.DB connection using the pgdriver with the DSN
	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))

	db := bun.NewDB(sqldb, pgdialect.New())

	return db
}
