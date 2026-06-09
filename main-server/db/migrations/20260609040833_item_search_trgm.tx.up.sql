SET statement_timeout = 0;

SELECT 1;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX item_name_trgm_idx ON item USING GIN (name gin_trgm_ops);
CREATE INDEX item_description_trgm_idx ON item USING GIN (description gin_trgm_ops);
