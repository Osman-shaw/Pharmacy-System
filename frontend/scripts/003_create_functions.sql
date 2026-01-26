-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'pharmacist')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at
  BEFORE UPDATE ON public.medicines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_invoice_number TEXT;
  invoice_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invoice_count FROM public.sales WHERE DATE(sale_date) = CURRENT_DATE;
  new_invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((invoice_count + 1)::TEXT, 4, '0');
  RETURN new_invoice_number;
END;
$$;

-- Function to generate unique prescription number
CREATE OR REPLACE FUNCTION public.generate_prescription_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_prescription_number TEXT;
  prescription_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO prescription_count FROM public.prescriptions WHERE DATE(created_at) = CURRENT_DATE;
  new_prescription_number := 'RX-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((prescription_count + 1)::TEXT, 4, '0');
  RETURN new_prescription_number;
END;
$$;

-- Function to get medicines expiring soon
CREATE OR REPLACE FUNCTION public.get_expiring_medicines(days_threshold INTEGER DEFAULT 30)
RETURNS TABLE (
  medicine_id UUID,
  medicine_name TEXT,
  batch_number TEXT,
  quantity INTEGER,
  expiry_date DATE,
  days_until_expiry INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    i.batch_number,
    i.quantity,
    i.expiry_date,
    (i.expiry_date - CURRENT_DATE) AS days_until_expiry
  FROM public.inventory i
  JOIN public.medicines m ON i.medicine_id = m.id
  WHERE i.expiry_date <= CURRENT_DATE + days_threshold
    AND i.quantity > 0
  ORDER BY i.expiry_date ASC;
END;
$$;

-- Function to get low stock medicines
CREATE OR REPLACE FUNCTION public.get_low_stock_medicines()
RETURNS TABLE (
  medicine_id UUID,
  medicine_name TEXT,
  total_quantity BIGINT,
  reorder_level INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    COALESCE(SUM(i.quantity), 0) AS total_quantity,
    m.reorder_level
  FROM public.medicines m
  LEFT JOIN public.inventory i ON m.id = i.medicine_id
  GROUP BY m.id, m.name, m.reorder_level
  HAVING COALESCE(SUM(i.quantity), 0) <= m.reorder_level
  ORDER BY total_quantity ASC;
END;
$$;
