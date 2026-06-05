package controllers

import (
	"context"

	"arias.systems.ice-wear-store/main-server/helpers"
	"arias.systems.ice-wear-store/main-server/internal/controllers/types"
	"arias.systems.ice-wear-store/main-server/internal/entities"
)

func GetAllItems(ctx context.Context, input *types.GetAllItemsInput) (*types.GetAllItemsOutput, error) {
	db := helpers.GetDB()

	var items []entities.Item
	count, err := db.NewSelect().
		Model(&items).
		Offset(input.Skip).
		Limit(input.Take).
		ScanAndCount(ctx)
	if err != nil {
		return nil, err
	}

	out := &types.GetAllItemsOutput{}
	out.Body.Items = items
	out.Body.Count = count
	return out, nil
}
