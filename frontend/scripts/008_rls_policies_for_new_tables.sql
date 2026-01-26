-- RLS Policies for new tables

-- Enable RLS on all new tables
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Designations Policies
CREATE POLICY "Users can view designations" ON designations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage designations" ON designations FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');

-- Employees Policies
CREATE POLICY "Users can view employees" ON employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage employees" ON employees FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');

-- Attendance Policies
CREATE POLICY "Users can view attendance" ON attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage attendance" ON attendance FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');

-- Payroll Policies (Admin only)
CREATE POLICY "Admins can view payroll" ON payroll FOR SELECT TO authenticated USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins can manage payroll" ON payroll FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');

-- Income Categories Policies
CREATE POLICY "Users can view income categories" ON income_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage income categories" ON income_categories FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');

-- Income Policies
CREATE POLICY "Users can view income" ON income FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage income" ON income FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');

-- Expense Categories Policies
CREATE POLICY "Users can view expense categories" ON expense_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage expense categories" ON expense_categories FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');

-- Expenses Policies
CREATE POLICY "Users can view expenses" ON expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage expenses" ON expenses FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');

-- Suppliers Policies
CREATE POLICY "Users can view suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage suppliers" ON suppliers FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');

-- Purchase Orders Policies
CREATE POLICY "Users can view purchase orders" ON purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage purchase orders" ON purchase_orders FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');

-- Purchase Order Items Policies
CREATE POLICY "Users can view purchase order items" ON purchase_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage purchase order items" ON purchase_order_items FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');
