-- Migration: Add EMI tracking columns to vehicles table
-- Run this in Supabase SQL Editor

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS emi_amount       NUMERIC         DEFAULT 0,
  ADD COLUMN IF NOT EXISTS emi_start_date   DATE,
  ADD COLUMN IF NOT EXISTS emi_tenure_months INTEGER        DEFAULT 0,
  ADD COLUMN IF NOT EXISTS emi_description  TEXT            DEFAULT '';
