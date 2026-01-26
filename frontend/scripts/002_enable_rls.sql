-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies (users can view and update their own profile)
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Medicines policies (authenticated users can view, only admins can modify)
CREATE POLICY "Authenticated users can view medicines"
  ON public.medicines FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert medicines"
  ON public.medicines FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update medicines"
  ON public.medicines FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete medicines"
  ON public.medicines FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Inventory policies (authenticated users can view, admins and pharmacists can modify)
CREATE POLICY "Authenticated users can view inventory"
  ON public.inventory FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can insert inventory"
  ON public.inventory FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'pharmacist')
    )
  );

CREATE POLICY "Staff can update inventory"
  ON public.inventory FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'pharmacist')
    )
  );

CREATE POLICY "Admins can delete inventory"
  ON public.inventory FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Customers policies
CREATE POLICY "Authenticated users can view customers"
  ON public.customers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can insert customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update customers"
  ON public.customers FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete customers"
  ON public.customers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sales policies
CREATE POLICY "Authenticated users can view sales"
  ON public.sales FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can insert sales"
  ON public.sales FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update sales"
  ON public.sales FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete sales"
  ON public.sales FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sale items policies
CREATE POLICY "Authenticated users can view sale items"
  ON public.sale_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can insert sale items"
  ON public.sale_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Prescriptions policies
CREATE POLICY "Authenticated users can view prescriptions"
  ON public.prescriptions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can insert prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete prescriptions"
  ON public.prescriptions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Prescription items policies
CREATE POLICY "Authenticated users can view prescription items"
  ON public.prescription_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can insert prescription items"
  ON public.prescription_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update prescription items"
  ON public.prescription_items FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Activity logs policies (everyone can insert, only admins can view all)
CREATE POLICY "Users can insert activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
