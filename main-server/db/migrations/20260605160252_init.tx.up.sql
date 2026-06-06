SET statement_timeout = 0;

SELECT 1;

CREATE TYPE source AS ENUM ('clemont', 'undergold', 'own');

CREATE TABLE item (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price BIGINT NOT NULL,
    source source NOT NULL DEFAULT 'own',
    pictures TEXT[],

    -- metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE item_variant (
    id UUID,
    name TEXT NOT NULL,

    item_id UUID NOT NULL REFERENCES item(id) ON DELETE CASCADE, -- reference to item

    PRIMARY KEY(item_id, id),

    -- metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
