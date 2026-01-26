-- Drop existing policies with infinite recursion issues
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert medicines" ON public.medicines;
DROP POLICY IF EXISTS "Admins can update medicines" ON public.medicines;
DROP POLICY IF EXISTS "Admins can delete medicines" ON public.medicines;
DROP POLICY IF EXISTS "Staff can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Staff can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can delete inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can delete customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can update sales" ON public.sales;
DROP POLICY IF EXISTS "Admins can delete sales" ON public.sales;
DROP POLICY IF EXISTS "Admins can delete prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;

-- Fixed profiles policies to avoid infinite recursion by using auth.jwt() to check role
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING ((auth.jwt()->>'role')::text = 'admin');

-- Fixed medicines policies to use auth.jwt() instead of subquery
CREATE POLICY "Admins can insert medicines"
  ON public.medicines FOR INSERT
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Admins can update medicines"
  ON public.medicines FOR UPDATE
  USING ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Admins can delete medicines"
  ON public.medicines FOR DELETE
  USING ((auth.jwt()->>'role')::text = 'admin');

-- Fixed inventory policies to use auth.jwt() instead of subquery
CREATE POLICY "Staff can insert inventory"
  ON public.inventory FOR INSERT
  WITH CHECK ((auth.jwt()->>'role')::text IN ('admin', 'pharmacist'));

CREATE POLICY "Staff can update inventory"
  ON public.inventory FOR UPDATE
  USING ((auth.jwt()->>'role')::text IN ('admin', 'pharmacist'));

CREATE POLICY "Admins can delete inventory"
  ON public.inventory FOR DELETE
  USING ((auth.jwt()->>'role')::text = 'admin');

-- Fixed customers policies
CREATE POLICY "Admins can delete customers"
  ON public.customers FOR DELETE
  USING ((auth.jwt()->>'role')::text = 'admin');

-- Fixed sales policies
CREATE POLICY "Admins can update sales"
  ON public.sales FOR UPDATE
  USING ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Admins can delete sales"
  ON public.sales FOR DELETE
  USING ((auth.jwt()->>'role')::text = 'admin');

-- Fixed prescriptions policies
CREATE POLICY "Admins can delete prescriptions"
  ON public.prescriptions FOR DELETE
  USING ((auth.jwt()->>'role')::text = 'admin');

-- Fixed activity logs policies
CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs FOR SELECT
  USING ((auth.jwt()->>'role')::text = 'admin');
