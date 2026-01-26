-- USERS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'STAFF', 'TECH_BRO')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REPAIRS
CREATE TABLE IF NOT EXISTS repairs (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  device_brand VARCHAR(50) NOT NULL,
  device_model VARCHAR(50) NOT NULL,
  problem TEXT NOT NULL,
  imei VARCHAR(50),
  status VARCHAR(20) DEFAULT 'NEW', -- NEW, PENDING, REPAIRED, DELIVERED, CANCELLED
  estimated_cost DECIMAL(10, 2) DEFAULT 0,
  advance DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) GENERATED ALWAYS AS (estimated_cost - advance) STORED,
  
  -- PIN/PATTERN SECURITY
  -- key_iv pairs or just encrypted blob.
  -- We will store base64 encoded encrypted strings
  pin_encrypted TEXT, 
  pattern_encrypted TEXT, -- serialized JSON of dots or similar, encrypted
  pin_iv TEXT, -- IV for decryption
  pattern_iv TEXT,
  
  images JSONB DEFAULT '[]', -- Array of image URLs
  
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  repair_id INTEGER REFERENCES repairs(id),
  type VARCHAR(20) NOT NULL, -- REPAIR, QUICK_SALE
  customer_name VARCHAR(100), -- Snapshot in case customer changes
  customer_mobile VARCHAR(20),
  items JSONB NOT NULL, -- Array of {description, qty, price}
  total_amount DECIMAL(10, 2) NOT NULL,
  paid_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  target_table VARCHAR(50),
  target_id INTEGER,
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEED ADMIN (Password: admin123) - hashed with bcrypt cost 10
-- $2a$10$w... is just a placeholder example, user should change this.
-- For demo: username 'admin', password 'admin123'
INSERT INTO users (username, password_hash, role)
VALUES ('admin', '$2a$10$X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7', 'ADMIN')
ON CONFLICT DO NOTHING;

-- SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO system_settings (key, value) VALUES ('maintenance_mode', 'false'::jsonb) ON CONFLICT DO NOTHING;

-- EXPENDITURES
CREATE TABLE IF NOT EXISTS expenditures (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL, -- 'STOCK', 'RENT', 'SALARY', 'BILLS', 'OTHER'
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
