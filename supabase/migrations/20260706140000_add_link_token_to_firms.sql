ALTER TABLE firms ADD COLUMN IF NOT EXISTS link_token TEXT UNIQUE DEFAULT uuid_generate_v4()::text;
UPDATE firms SET link_token = uuid_generate_v4()::text WHERE link_token IS NULL OR link_token = '';
