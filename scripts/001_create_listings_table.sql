-- Create listings table for JugaadBank marketplace
CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  description TEXT NOT NULL,
  lending_price INTEGER NOT NULL,
  owner_uid TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_roll_number TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'borrowed', 'unavailable')),
  category TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_owner_uid ON listings(owner_uid);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
