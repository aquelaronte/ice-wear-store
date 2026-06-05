package entities

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Item struct {
	bun.BaseModel `bun:"table:item" json:"-"`

	ID          uuid.UUID `bun:"id,pk,type:uuid" json:"id"`
	Name        string    `bun:"name,notnull" json:"name"`
	Description *string   `bun:"description" json:"description,omitempty"`
	Price       int       `bun:"price,notnull" json:"price"`
	Pictures    []string  `bun:"pictures,type:text[]" json:"pictures"`

	DeletedAt *time.Time `bun:"deleted_at,soft_delete" json:"deleted_at,omitempty"`
	UpdatedAt time.Time  `bun:"updated_at,notnull,default:current_timestamp" json:"updated_at"`
	CreatedAt time.Time  `bun:"created_at,notnull,default:current_timestamp" json:"created_at"`
}
