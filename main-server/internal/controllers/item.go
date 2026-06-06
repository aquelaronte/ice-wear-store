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

func GetItemById(ctx context.Context, input *types.GetItemByIdInput) (*types.GetItemByIdOutput, error) {
	db := helpers.GetDB()

	item := new(entities.Item)

	err := db.NewSelect().
		Model(item).
		Where("id = ?", input.ID).
		Scan(ctx)

	if err != nil {
		return nil, err
	}

	out := &types.GetItemByIdOutput{}
	out.Body.Item = item
	return out, nil
}
