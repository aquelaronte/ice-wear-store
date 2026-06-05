package entities

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type ItemVariant struct {
	bun.BaseModel `bun:"table:item_variant" json:"-"`

	ID   uuid.UUID `bun:"id,pk,type:uuid" json:"id"`
	Name string    `bun:"name,notnull" json:"name"`

	ItemID uuid.UUID `bun:"item_id,notnull,type:uuid" json:"item_id"`

	Item *Item `bun:"rel:belongs-to,join:item_id=id" json:"item,omitempty"`

	DeletedAt *time.Time `bun:"deleted_at,soft_delete" json:"deleted_at,omitempty"`
	UpdatedAt time.Time  `bun:"updated_at,notnull,default:current_timestamp" json:"updated_at"`
	CreatedAt time.Time  `bun:"created_at,notnull,default:current_timestamp" json:"created_at"`
}
