package types

import "arias.systems.ice-wear-store/main-server/internal/entities"

type GetAllItemsOutput struct {
	Body struct {
		Items []entities.Item `json:"items"`
		Count int             `json:"count"`
	}
}

type GetAllItemsInput struct {
	Skip   int    `query:"skip" minimum:"0" default:"0" doc:"Items to skip"`
	Take   int    `query:"take" minimum:"1" maximum:"100" default:"20" doc:"Items to return"`
	Search string `query:"search" doc:"Fuzzy search across item name and description"`
}

type GetItemByIdInput struct {
	ID string `path:"id" doc:"item id to retrieve"`
}

type GetItemByIdOutput struct {
	Body struct {
		Item *entities.Item `json:"item"`
	}
}

type GetAllItemsByIdListInput struct {
	IDs []string `query:"ids"`
}

type GetAllItemsByIdListOutput struct {
	Body struct {
		Items []entities.Item `json:"items"`
	}
}
