-- Change FK on transactions to point to vendors instead of profiles
-- This allows us to join with vendors table to get business_name

ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS fk_transactions_profiles;

ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS fk_transactions_vendors;

ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_vendors
FOREIGN KEY (user_id)
REFERENCES vendors(id)
ON DELETE CASCADE;
