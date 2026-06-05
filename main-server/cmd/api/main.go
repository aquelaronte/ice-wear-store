package main

import (
	"fmt"

	"arias.systems.ice-wear-store/main-server/config"
	"arias.systems.ice-wear-store/main-server/helpers"
	"arias.systems.ice-wear-store/main-server/internal/controllers"
	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humafiber"
	"github.com/gofiber/fiber/v3"
)

func main() {
	app := fiber.New()
	api := humafiber.New(app, huma.DefaultConfig("Ice Wear Store API", "0.0.1"))

	helpers.InitDB(helpers.NewDBFromEnv())

	huma.Get(api, "/products", controllers.GetAllItems)

	app.Listen(fmt.Sprintf(":%s", config.Envs.Port))
}
