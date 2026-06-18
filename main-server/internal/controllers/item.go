package controllers

import (
	"context"
	"strings"

	"arias.systems.ice-wear-store/main-server/helpers"
	"arias.systems.ice-wear-store/main-server/internal/controllers/types"
	"arias.systems.ice-wear-store/main-server/internal/entities"
	"github.com/uptrace/bun"
)

func GetAllItems(ctx context.Context, input *types.GetAllItemsInput) (*types.GetAllItemsOutput, error) {
	db := helpers.GetDB()

	var items []entities.Item
	q := db.NewSelect().Model(&items)

	if search := strings.TrimSpace(input.Search); search != "" {
		pattern := "%" + search + "%"
		q = q.
			Where("name ILIKE ? OR description ILIKE ?", pattern, pattern).
			OrderExpr("GREATEST(similarity(name, ?), similarity(COALESCE(description, ''), ?)) DESC", search, search)
	}

	count, err := q.
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

func GetItemsByIdList(ctx context.Context, input *types.GetAllItemsByIdListInput) (*types.GetAllItemsByIdListOutput, error) {
	db := helpers.GetDB()

	out := &types.GetAllItemsByIdListOutput{}
	if len(input.IDs) == 0 {
		out.Body.Items = []entities.Item{}
		return out, nil
	}

	var items []entities.Item
	sel := db.NewSelect().
		Model(&items).
		Where("id IN (?)", bun.List(input.IDs))

	err := sel.Scan(ctx)

	if err != nil {
		return nil, err
	}

	out.Body.Items = items
	return out, nil
}
