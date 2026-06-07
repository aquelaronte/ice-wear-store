SET statement_timeout = 0;

SELECT 1;

CREATE TYPE source AS ENUM ('clemont', 'undergold', 'own');
CREATE TYPE message_role AS ENUM ('user', 'ai');
CREATE TYPE message_type AS ENUM ('text', 'image');

CREATE TABLE item (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    llm_description TEXT,
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

CREATE TABLE thread (
    id UUID PRIMARY KEY,

    -- metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE thread_message (
    id UUID,

    content TEXT NOT NULL,
    message_role message_role NOT NULL DEFAULT 'user',
    message_type message_type NOT NULL DEFAULT 'text',

    thread_id UUID NOT NULL REFERENCES thread(id) ON DELETE CASCADE,

    PRIMARY KEY(thread_id, id),

    -- metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
