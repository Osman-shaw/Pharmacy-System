-- Seed sample medicine categories and data (for demo purposes)
-- Note: In production, this would be populated through the admin interface

-- Sample medicines
INSERT INTO public.medicines (name, generic_name, category, manufacturer, description, dosage_form, strength, unit, reorder_level, storage_instructions)
VALUES
  ('Paracetamol', 'Acetaminophen', 'Analgesics', 'GSK', 'Pain reliever and fever reducer', 'Tablet', '500mg', 'tablets', 100, 'Store at room temperature'),
  ('Amoxicillin', 'Amoxicillin', 'Antibiotics', 'Pfizer', 'Antibiotic used to treat bacterial infections', 'Capsule', '250mg', 'capsules', 50, 'Store in a cool, dry place'),
  ('Ibuprofen', 'Ibuprofen', 'Analgesics', 'Advil', 'Anti-inflammatory pain reliever', 'Tablet', '400mg', 'tablets', 80, 'Store at room temperature'),
  ('Cetirizine', 'Cetirizine HCl', 'Antihistamines', 'UCB', 'Allergy relief medication', 'Tablet', '10mg', 'tablets', 60, 'Store at room temperature'),
  ('Omeprazole', 'Omeprazole', 'Antacids', 'AstraZeneca', 'Proton pump inhibitor for acid reflux', 'Capsule', '20mg', 'capsules', 40, 'Store in a cool, dry place'),
  ('Metformin', 'Metformin HCl', 'Antidiabetic', 'Bristol-Myers Squibb', 'Type 2 diabetes medication', 'Tablet', '500mg', 'tablets', 70, 'Store at room temperature'),
  ('Lisinopril', 'Lisinopril', 'Antihypertensives', 'Merck', 'ACE inhibitor for high blood pressure', 'Tablet', '10mg', 'tablets', 50, 'Store at room temperature'),
  ('Salbutamol', 'Albuterol', 'Bronchodilators', 'GlaxoSmithKline', 'Asthma and COPD treatment', 'Inhaler', '100mcg', 'inhalers', 20, 'Store at room temperature'),
  ('Ciprofloxacin', 'Ciprofloxacin', 'Antibiotics', 'Bayer', 'Fluoroquinolone antibiotic', 'Tablet', '500mg', 'tablets', 30, 'Store in a cool, dry place'),
  ('Aspirin', 'Acetylsalicylic Acid', 'Analgesics', 'Bayer', 'Pain reliever and blood thinner', 'Tablet', '75mg', 'tablets', 100, 'Store at room temperature')
ON CONFLICT DO NOTHING;

-- Note: Inventory, customers, sales will be added through the application interface
