-- Seed data for new tables

-- Insert default designations
INSERT INTO designations (name, description, base_salary) VALUES
  ('Pharmacist', 'Licensed pharmacist', 5000.00),
  ('Pharmacy Technician', 'Pharmacy assistant', 3000.00),
  ('Cashier', 'Front desk cashier', 2000.00),
  ('Store Manager', 'Inventory and store manager', 4000.00),
  ('Accountant', 'Finance and accounting', 4500.00)
ON CONFLICT (name) DO NOTHING;

-- Insert default income categories
INSERT INTO income_categories (name, description) VALUES
  ('Medicine Sales', 'Revenue from medicine sales'),
  ('Consultation Fees', 'Medical consultation charges'),
  ('Other Services', 'Other pharmacy services')
ON CONFLICT (name) DO NOTHING;

-- Insert default expense categories
INSERT INTO expense_categories (name, description) VALUES
  ('Salaries', 'Employee salaries and wages'),
  ('Rent', 'Pharmacy rent'),
  ('Utilities', 'Electricity, water, internet'),
  ('Supplies', 'Office and medical supplies'),
  ('Maintenance', 'Equipment and facility maintenance'),
  ('Marketing', 'Advertising and promotions'),
  ('Transportation', 'Delivery and logistics'),
  ('Insurance', 'Business insurance'),
  ('Taxes', 'Government taxes and fees'),
  ('Other', 'Miscellaneous expenses')
ON CONFLICT (name) DO NOTHING;
