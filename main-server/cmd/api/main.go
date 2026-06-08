package main

import (
	"fmt"

	"arias.systems.ice-wear-store/main-server/config"
	"arias.systems.ice-wear-store/main-server/helpers"
	"arias.systems.ice-wear-store/main-server/internal/controllers"
	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humafiber"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
)

func main() {
	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: config.Envs.CORSOrigins,
	}))
	api := humafiber.New(app, huma.DefaultConfig("Ice Wear Store API", "0.0.1"))

	helpers.InitDB(helpers.NewDBFromEnv())

	huma.Get(api, "/products", controllers.GetAllItems)
	huma.Get(api, "/products/{id}", controllers.GetItemById)
	huma.Post(api, "/chat", controllers.Chat)

	app.Listen(fmt.Sprintf(":%s", config.Envs.Port))
}
