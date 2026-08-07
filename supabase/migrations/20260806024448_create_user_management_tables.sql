/*
# User Management Module — Schema

## Overview
Creates the complete data model for the SteelForce Portal User Management module.
This is a single-tenant admin tool (no public sign-in screen), so policies allow
anon + authenticated CRUD — the data is intentionally shared among portal operators.

## New Tables
1. `departments` — organizational units (Sales, Finance, HR, Warehouse, IT, Administration)
   - id, name, description, manager_name, created_at
2. `roles` — RBAC role definitions (Super Admin, Administrator, Manager, etc.)
   - id, name, description, is_system (system roles cannot be deleted), permissions (jsonb), created_at
3. `app_users` — the managed user accounts (distinct from auth.users)
   - id, full_name, employee_id, username, email, phone, gender, birthday, address,
     department_id (FK), position, role_id (FK), manager_name, join_date, employment_status,
     account_status (active/disabled/locked), avatar_url, temp_password, force_password_reset,
     failed_login_attempts, last_login, last_password_change, created_at, updated_at, deleted_at (soft delete)
4. `activity_logs` — audit trail of every administrative action
   - id, user_id (FK to app_users), action, target_user_id, ip_address, browser, device, status, created_at
5. `login_history` — login/logout audit records
   - id, user_id (FK to app_users), login_time, logout_time, device, browser, os, ip_address, location, status, created_at

## Security
- RLS enabled on every table.
- Policies allow anon + authenticated full CRUD (single-tenant shared admin tool, no public sign-in).

## Notes
- `permissions` on roles is a jsonb column storing a matrix of module -> [actions].
- Soft delete via `deleted_at` on app_users; archived users can be restored or permanently deleted.
- System roles (is_system = true) are protected from deletion at the application level.
*/

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  manager_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_departments" ON departments;
CREATE POLICY "anon_select_departments" ON departments FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_departments" ON departments;
CREATE POLICY "anon_insert_departments" ON departments FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_departments" ON departments;
CREATE POLICY "anon_update_departments" ON departments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_departments" ON departments;
CREATE POLICY "anon_delete_departments" ON departments FOR DELETE TO anon, authenticated USING (true);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_roles" ON roles;
CREATE POLICY "anon_select_roles" ON roles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_roles" ON roles;
CREATE POLICY "anon_insert_roles" ON roles FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_roles" ON roles;
CREATE POLICY "anon_update_roles" ON roles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_roles" ON roles;
CREATE POLICY "anon_delete_roles" ON roles FOR DELETE TO anon, authenticated USING (true);

-- App Users (managed accounts)
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  employee_id text,
  username text NOT NULL,
  email text,
  phone text,
  gender text,
  birthday date,
  address text,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  position text,
  role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
  manager_name text,
  join_date date,
  employment_status text NOT NULL DEFAULT 'Active',
  account_status text NOT NULL DEFAULT 'active',
  avatar_url text,
  temp_password text,
  force_password_reset boolean NOT NULL DEFAULT true,
  failed_login_attempts integer NOT NULL DEFAULT 0,
  last_login timestamptz,
  last_password_change timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_app_users" ON app_users;
CREATE POLICY "anon_select_app_users" ON app_users FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_app_users" ON app_users;
CREATE POLICY "anon_insert_app_users" ON app_users FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_app_users" ON app_users;
CREATE POLICY "anon_update_app_users" ON app_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_app_users" ON app_users;
CREATE POLICY "anon_delete_app_users" ON app_users FOR DELETE TO anon, authenticated USING (true);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  ip_address text,
  browser text,
  device text,
  status text NOT NULL DEFAULT 'success',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_activity_logs" ON activity_logs;
CREATE POLICY "anon_select_activity_logs" ON activity_logs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_activity_logs" ON activity_logs;
CREATE POLICY "anon_insert_activity_logs" ON activity_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_activity_logs" ON activity_logs;
CREATE POLICY "anon_update_activity_logs" ON activity_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_activity_logs" ON activity_logs;
CREATE POLICY "anon_delete_activity_logs" ON activity_logs FOR DELETE TO anon, authenticated USING (true);

-- Login History
CREATE TABLE IF NOT EXISTS login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  login_time timestamptz NOT NULL DEFAULT now(),
  logout_time timestamptz,
  device text,
  browser text,
  os text,
  ip_address text,
  location text,
  status text NOT NULL DEFAULT 'success',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_login_history" ON login_history;
CREATE POLICY "anon_select_login_history" ON login_history FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_login_history" ON login_history;
CREATE POLICY "anon_insert_login_history" ON login_history FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_login_history" ON login_history;
CREATE POLICY "anon_update_login_history" ON login_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_login_history" ON login_history;
CREATE POLICY "anon_delete_login_history" ON login_history FOR DELETE TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_users_department_id ON app_users(department_id);
CREATE INDEX IF NOT EXISTS idx_app_users_role_id ON app_users(role_id);
CREATE INDEX IF NOT EXISTS idx_app_users_deleted_at ON app_users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_app_users_account_status ON app_users(account_status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_time ON login_history(login_time DESC);

-- Auto-update updated_at on app_users
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_app_users_updated_at ON app_users;
CREATE TRIGGER trg_app_users_updated_at
  BEFORE UPDATE ON app_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Seed default departments
INSERT INTO departments (name, description, manager_name) VALUES
  ('Sales', 'Sales and business development', 'Ahmad Reza'),
  ('Finance', 'Financial operations and accounting', 'Sara Karimi'),
  ('HR', 'Human resources', 'Mehdi Ahmadi'),
  ('Warehouse', 'Inventory and logistics', 'Reza Mohammadi'),
  ('IT', 'Information technology', 'Niloofar S.'),
  ('Administration', 'General administration', 'Omid Farahi')
ON CONFLICT DO NOTHING;

-- Seed system roles with permission matrices
INSERT INTO roles (name, description, is_system, permissions) VALUES
  ('Super Admin', 'Full system access with no restrictions', true,
    '{"dashboard":["view","edit"],"orders":["create","view","update","delete","export"],"customers":["create","view","update","delete"],"users":["create","view","update","delete","reset_password"],"reports":["view","export"],"settings":["manage"]}'::jsonb),
  ('Administrator', 'System administration with user management', true,
    '{"dashboard":["view","edit"],"orders":["create","view","update","delete","export"],"customers":["create","view","update","delete"],"users":["create","view","update","delete","reset_password"],"reports":["view","export"],"settings":["manage"]}'::jsonb),
  ('Manager', 'Department manager with oversight access', true,
    '{"dashboard":["view"],"orders":["create","view","update","export"],"customers":["create","view","update"],"users":["view"],"reports":["view","export"],"settings":[]}'::jsonb),
  ('Sales Supervisor', 'Supervises sales representatives', true,
    '{"dashboard":["view"],"orders":["create","view","update","export"],"customers":["create","view","update"],"users":["view"],"reports":["view"],"settings":[]}'::jsonb),
  ('Sales Representative', 'Field sales and customer visits', true,
    '{"dashboard":["view"],"orders":["create","view","update"],"customers":["create","view","update"],"users":[],"reports":[],"settings":[]}'::jsonb),
  ('Finance', 'Financial operations', true,
    '{"dashboard":["view"],"orders":["view","export"],"customers":["view"],"users":["view"],"reports":["view","export"],"settings":[]}'::jsonb),
  ('Warehouse', 'Inventory management', true,
    '{"dashboard":["view"],"orders":["view","update"],"customers":["view"],"users":[],"reports":["view"],"settings":[]}'::jsonb),
  ('Customer Service', 'Customer support', true,
    '{"dashboard":["view"],"orders":["view"],"customers":["view","update"],"users":[],"reports":[],"settings":[]}'::jsonb),
  ('Viewer', 'Read-only access', true,
    '{"dashboard":["view"],"orders":["view"],"customers":["view"],"users":["view"],"reports":["view"],"settings":[]}'::jsonb)
ON CONFLICT DO NOTHING;

-- Seed sample app users
INSERT INTO app_users (full_name, employee_id, username, email, phone, gender, birthday, address, department_id, position, role_id, manager_name, join_date, employment_status, account_status, force_password_reset, failed_login_attempts, last_login, last_password_change)
SELECT 'Ahmad Reza', 'EMP-001', 'ahmad.reza', 'ahmad.reza@steelforce.com', '+98 912 345 6789', 'Male', '1985-03-15', 'Tehran, Iran', d.id, 'Sales Manager', r.id, 'Omid Farahi', '2020-01-15', 'Active', 'active', false, 0, now() - interval '2 hours', now() - interval '30 days'
FROM departments d, roles r WHERE d.name = 'Sales' AND r.name = 'Sales Supervisor'
ON CONFLICT DO NOTHING;

INSERT INTO app_users (full_name, employee_id, username, email, phone, gender, birthday, address, department_id, position, role_id, manager_name, join_date, employment_status, account_status, force_password_reset, failed_login_attempts, last_login, last_password_change)
SELECT 'Sara Karimi', 'EMP-002', 'sara.karimi', 'sara.karimi@steelforce.com', '+98 912 222 3344', 'Female', '1990-07-22', 'Isfahan, Iran', d.id, 'Financial Analyst', r.id, 'Mehdi Ahmadi', '2021-06-01', 'Active', 'active', false, 0, now() - interval '1 day', now() - interval '15 days'
FROM departments d, roles r WHERE d.name = 'Finance' AND r.name = 'Finance'
ON CONFLICT DO NOTHING;

INSERT INTO app_users (full_name, employee_id, username, email, phone, gender, birthday, address, department_id, position, role_id, manager_name, join_date, employment_status, account_status, force_password_reset, failed_login_attempts, last_login, last_password_change)
SELECT 'Mehdi Ahmadi', 'EMP-003', 'mehdi.ahmadi', 'mehdi.ahmadi@steelforce.com', '+98 912 555 7788', 'Male', '1988-11-30', 'Tehran, Iran', d.id, 'HR Manager', r.id, 'Omid Farahi', '2019-03-10', 'Active', 'active', false, 0, now() - interval '5 hours', now() - interval '60 days'
FROM departments d, roles r WHERE d.name = 'HR' AND r.name = 'Manager'
ON CONFLICT DO NOTHING;

INSERT INTO app_users (full_name, employee_id, username, email, phone, gender, birthday, address, department_id, position, role_id, manager_name, join_date, employment_status, account_status, force_password_reset, failed_login_attempts, last_login, last_password_change)
SELECT 'Niloofar S.', 'EMP-004', 'niloofar.s', 'niloofar.s@steelforce.com', '+98 912 888 9900', 'Female', '1992-01-18', 'Tehran, Iran', d.id, 'IT Specialist', r.id, 'Omid Farahi', '2022-09-15', 'Active', 'active', true, 2, now() - interval '3 days', now() - interval '90 days'
FROM departments d, roles r WHERE d.name = 'IT' AND r.name = 'Administrator'
ON CONFLICT DO NOTHING;

INSERT INTO app_users (full_name, employee_id, username, email, phone, gender, birthday, address, department_id, position, role_id, manager_name, join_date, employment_status, account_status, force_password_reset, failed_login_attempts, last_login, last_password_change)
SELECT 'Reza Mohammadi', 'EMP-005', 'reza.mohammadi', 'reza.mohammadi@steelforce.com', '+98 912 111 2233', 'Male', '1983-05-25', 'Khouzestan, Iran', d.id, 'Warehouse Supervisor', r.id, 'Omid Farahi', '2018-07-20', 'Active', 'disabled', false, 5, now() - interval '10 days', now() - interval '45 days'
FROM departments d, roles r WHERE d.name = 'Warehouse' AND r.name = 'Warehouse'
ON CONFLICT DO NOTHING;

INSERT INTO app_users (full_name, employee_id, username, email, phone, gender, birthday, address, department_id, position, role_id, manager_name, join_date, employment_status, account_status, force_password_reset, failed_login_attempts, last_login, last_password_change)
SELECT 'Omid Farahi', 'EMP-006', 'omid.farahi', 'omid.farahi@steelforce.com', '+98 912 444 5566', 'Male', '1980-09-12', 'Tehran, Iran', d.id, 'General Manager', r.id, null, '2017-01-05', 'Active', 'active', false, 0, now() - interval '1 hour', now() - interval '20 days'
FROM departments d, roles r WHERE d.name = 'Administration' AND r.name = 'Super Admin'
ON CONFLICT DO NOTHING;

INSERT INTO app_users (full_name, employee_id, username, email, phone, gender, birthday, address, department_id, position, role_id, manager_name, join_date, employment_status, account_status, force_password_reset, failed_login_attempts, last_login, last_password_change)
SELECT 'Leila Hosseini', 'EMP-007', 'leila.hosseini', 'leila.hosseini@steelforce.com', '+98 912 777 8899', 'Female', '1995-04-08', 'Tehran, Iran', d.id, 'Sales Representative', r.id, 'Ahmad Reza', '2023-02-14', 'Active', 'active', true, 0, now() - interval '6 hours', now() - interval '5 days'
FROM departments d, roles r WHERE d.name = 'Sales' AND r.name = 'Sales Representative'
ON CONFLICT DO NOTHING;

INSERT INTO app_users (full_name, employee_id, username, email, phone, gender, birthday, address, department_id, position, role_id, manager_name, join_date, employment_status, account_status, force_password_reset, failed_login_attempts, last_login, last_password_change)
SELECT 'Kian Mehrabi', 'EMP-008', 'kian.mehrabi', 'kian.mehrabi@steelforce.com', '+98 912 666 1122', 'Male', '1993-12-03', 'Isfahan, Iran', d.id, 'Sales Representative', r.id, 'Ahmad Reza', '2023-05-20', 'Active', 'active', false, 0, now() - interval '8 hours', now() - interval '10 days'
FROM departments d, roles r WHERE d.name = 'Sales' AND r.name = 'Sales Representative'
ON CONFLICT DO NOTHING;

-- Seed sample activity logs
INSERT INTO activity_logs (user_id, action, target_user_id, ip_address, browser, device, status, created_at)
SELECT au.id, 'User Created', null, '192.168.1.100', 'Chrome 120', 'Desktop', 'success', now() - interval '1 hour'
FROM app_users au WHERE au.username = 'omid.farahi' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO activity_logs (user_id, action, target_user_id, ip_address, browser, device, status, created_at)
SELECT au.id, 'Password Reset', null, '192.168.1.100', 'Chrome 120', 'Desktop', 'success', now() - interval '2 hours'
FROM app_users au WHERE au.username = 'omid.farahi' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO activity_logs (user_id, action, target_user_id, ip_address, browser, device, status, created_at)
SELECT au.id, 'Role Changed', null, '192.168.1.101', 'Firefox 121', 'Laptop', 'success', now() - interval '3 hours'
FROM app_users au WHERE au.username = 'ahmad.reza' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO activity_logs (user_id, action, target_user_id, ip_address, browser, device, status, created_at)
SELECT au.id, 'Login', null, '192.168.1.102', 'Safari 17', 'Mobile', 'success', now() - interval '5 hours'
FROM app_users au WHERE au.username = 'sara.karimi' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO activity_logs (user_id, action, target_user_id, ip_address, browser, device, status, created_at)
SELECT au.id, 'Login Failed', null, '192.168.1.103', 'Chrome 120', 'Desktop', 'failed', now() - interval '6 hours'
FROM app_users au WHERE au.username = 'reza.mohammadi' LIMIT 1
ON CONFLICT DO NOTHING;

-- Seed sample login history
INSERT INTO login_history (user_id, login_time, logout_time, device, browser, os, ip_address, location, status)
SELECT au.id, now() - interval '2 hours', now() - interval '1 hour', 'Desktop', 'Chrome 120', 'Windows 11', '192.168.1.100', 'Tehran, Iran', 'success'
FROM app_users au WHERE au.username = 'ahmad.reza' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO login_history (user_id, login_time, logout_time, device, browser, os, ip_address, location, status)
SELECT au.id, now() - interval '1 day', now() - interval '23 hours', 'Laptop', 'Firefox 121', 'macOS 14', '192.168.1.101', 'Isfahan, Iran', 'success'
FROM app_users au WHERE au.username = 'sara.karimi' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO login_history (user_id, login_time, logout_time, device, browser, os, ip_address, location, status)
SELECT au.id, now() - interval '5 hours', null, 'Mobile', 'Safari 17', 'iOS 17', '192.168.1.102', 'Tehran, Iran', 'success'
FROM app_users au WHERE au.username = 'mehdi.ahmadi' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO login_history (user_id, login_time, logout_time, device, browser, os, ip_address, location, status)
SELECT au.id, now() - interval '6 hours', null, 'Desktop', 'Chrome 120', 'Windows 11', '192.168.1.103', 'Khouzestan, Iran', 'failed'
FROM app_users au WHERE au.username = 'reza.mohammadi' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO login_history (user_id, login_time, logout_time, device, browser, os, ip_address, location, status)
SELECT au.id, now() - interval '1 hour', null, 'Desktop', 'Chrome 120', 'Windows 11', '192.168.1.100', 'Tehran, Iran', 'success'
FROM app_users au WHERE au.username = 'omid.farahi' LIMIT 1
ON CONFLICT DO NOTHING;
