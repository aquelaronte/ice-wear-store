package types

import "arias.systems.ice-wear-store/main-server/internal/entities"

type GetAllItemsOutput struct {
	Body struct {
		Items []entities.Item `json:"items"`
		Count int             `json:"count"`
	}
}

type GetAllItemsInput struct {
	Skip int `query:"skip" minimum:"0" default:"0" doc:"Items to skip"`
	Take int `query:"take" minimum:"1" maximum:"100" default:"20" doc:"Items to return"`
}
