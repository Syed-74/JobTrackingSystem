-- Enable UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 1. Create Table: users (Core Authentication)
-- =========================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    user_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_type CHECK (user_type IN ('SUPER_ADMIN', 'COMPANY_USER', 'EMPLOYEE'))
);

-- =========================================================================
-- 2. Create Table: super_admin (Profiles for Super Admins)
-- =========================================================================
CREATE TABLE IF NOT EXISTS super_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    address TEXT NOT NULL,
    state VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    pincode VARCHAR(255) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_created BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================================
-- 3. Create Table: company (Company Profiles)
-- =========================================================================
CREATE TABLE IF NOT EXISTS company (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_description TEXT NOT NULL,
    company_address TEXT NOT NULL,
    company_state VARCHAR(255) NOT NULL,
    company_city VARCHAR(255) NOT NULL,
    company_pincode VARCHAR(255) NOT NULL,
    company_logo VARCHAR(255),
    company_website VARCHAR(255),
    industry_type VARCHAR(255),
    company_size VARCHAR(50),
    company_email VARCHAR(255),
    company_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    is_created BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- =========================================================================
-- 4. Create Table: company_admin (Staff/Recruiters/Hiring Managers)
-- =========================================================================
CREATE TABLE IF NOT EXISTS company_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    company_id UUID NOT NULL,
    admin_name VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) UNIQUE NOT NULL,
    admin_phone VARCHAR(20) NOT NULL,
    admin_alternate_phone VARCHAR(20),
    admin_gender VARCHAR(50),
    admin_dob DATE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_created BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE
);

-- =========================================================================
-- 5. Create Table: address
-- =========================================================================
CREATE TABLE IF NOT EXISTS address (
    id UUID PRIMARY KEY REFERENCES company_admin(id) ON DELETE CASCADE,
    admin_address TEXT NOT NULL,
    admin_city VARCHAR(255) NOT NULL,
    admin_state VARCHAR(255) NOT NULL,
    admin_country VARCHAR(255) NOT NULL,
    admin_pincode VARCHAR(20) NOT NULL
);

-- =========================================================================
-- 6. Create Table: profile
-- =========================================================================
CREATE TABLE IF NOT EXISTS profile (
    id UUID PRIMARY KEY REFERENCES company_admin(id) ON DELETE CASCADE,
    admin_profile_picture TEXT,
    admin_designation VARCHAR(255),
    admin_department VARCHAR(255),
    admin_bio TEXT
);

-- =========================================================================
-- 7. Automations: Indexes and Trigger Functions
-- =========================================================================

-- Index for faster lookup by email
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Trigger function for snake_case tables
CREATE OR REPLACE FUNCTION update_snake_case_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Binding Triggers
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_snake_case_updated_at();

DROP TRIGGER IF EXISTS trigger_update_super_admin_updated_at ON super_admin;
CREATE TRIGGER trigger_update_super_admin_updated_at
    BEFORE UPDATE ON super_admin
    FOR EACH ROW
    EXECUTE FUNCTION update_snake_case_updated_at();

DROP TRIGGER IF EXISTS trigger_update_company_updated_at ON company;
CREATE TRIGGER trigger_update_company_updated_at
    BEFORE UPDATE ON company
    FOR EACH ROW
    EXECUTE FUNCTION update_snake_case_updated_at();

DROP TRIGGER IF EXISTS trigger_update_company_admin_updated_at ON company_admin;
CREATE TRIGGER trigger_update_company_admin_updated_at
    BEFORE UPDATE ON company_admin
    FOR EACH ROW
    EXECUTE FUNCTION update_snake_case_updated_at();
