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

DROP TABLE IF EXISTS saved_jobs CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS employee_documents CASCADE;
DROP TABLE IF EXISTS employee_details CASCADE;

CREATE TABLE employee_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    profile_picture TEXT,
    gender VARCHAR(20),
    dob DATE,
    marital_status VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pincode VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_number VARCHAR(20),
    skills TEXT,
    education JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    resume_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employee_details(id) ON DELETE CASCADE,
    document_type VARCHAR(100),
    document_number VARCHAR(255),
    document_url TEXT,
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

CREATE TABLE IF NOT EXISTS department (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    department_code VARCHAR(50) NOT NULL,
    headcount_quota INTEGER DEFAULT 0,
    assigned_manager_id UUID,
    description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_by UUID NOT NULL,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_department_company
        FOREIGN KEY (company_id)
        REFERENCES company(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_department_manager
        FOREIGN KEY (assigned_manager_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_department_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_department_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT uk_department_company_code
        UNIQUE (company_id, department_code),

    CONSTRAINT uk_department_company_name
        UNIQUE (company_id, department_name)
);

CREATE TABLE IF NOT EXISTS company_account_manage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    company_id UUID NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    gender VARCHAR(20),
    date_of_birth DATE,
    department_id UUID,
    designation VARCHAR(150),
    bio TEXT,
    address TEXT,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    is_first_login BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_company_account_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_company_account_company
        FOREIGN KEY (company_id)
        REFERENCES company(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_company_account_department
        FOREIGN KEY (department_id)
        REFERENCES department(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_company_account_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
);
    
CREATE TABLE IF NOT EXISTS job_posting (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    department_id UUID NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    job_requirements TEXT NOT NULL,
    job_responsibilities TEXT,
    job_type VARCHAR(50) NOT NULL,          -- Full-time, Part-time, Contract
    work_mode VARCHAR(50),                  -- Remote, Hybrid, Onsite
    location VARCHAR(255),
    salary_min NUMERIC(12,2),
    salary_max NUMERIC(12,2),
    salary_currency VARCHAR(10),
    experience_min INT,
    experience_max INT,
    education VARCHAR(255),
    skills TEXT,
    openings INT DEFAULT 1,
    employment_level VARCHAR(100),          -- Junior, Mid, Senior, Lead
    assigned_recruiter UUID,
    application_deadline DATE,
    expected_joining_date DATE,
    status VARCHAR(50) DEFAULT 'OPEN',      -- OPEN,CLOSED,DRAFT,ON_HOLD
    is_featured BOOLEAN DEFAULT FALSE,
    total_applications INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(company_id) REFERENCES company(id),
    FOREIGN KEY(department_id) REFERENCES department(id)
);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relations
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES job_posting(job_id) ON DELETE CASCADE,
    -- Applicant Information Snapshot
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    -- Resume & Cover Letter
    resume_url TEXT NOT NULL,
    cover_letter TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    -- Experience Details
    total_experience DECIMAL(4,1),
    current_company VARCHAR(255),
    current_designation VARCHAR(255),
    current_ctc DECIMAL(12,2),
    expected_ctc DECIMAL(12,2),
    notice_period VARCHAR(100),
    -- Location
    current_location VARCHAR(255),
    preferred_location VARCHAR(255),
    -- Application Status
    status VARCHAR(50) DEFAULT 'Applied',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    interview_date TIMESTAMP WITH TIME ZONE,
    offered_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    -- HR Information
    recruiter_notes TEXT,
    rejection_reason TEXT,
    interview_feedback TEXT,
    -- Candidate Preferences
    willing_to_relocate BOOLEAN DEFAULT FALSE,
    willing_to_work_remote BOOLEAN DEFAULT TRUE,
    -- Metadata
    source VARCHAR(100),           -- LinkedIn, Referral, Company Portal
    application_version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_job_application UNIQUE (user_id, job_id)
);

CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES job_posting(job_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_saved_job UNIQUE (user_id, job_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO', -- NEW_JOB, STATUS_UPDATE, INTERVIEW, RECRUITER_MSG
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

DROP TRIGGER IF EXISTS trigger_update_company_account_updated_at ON company_account_manage;
CREATE TRIGGER trigger_update_company_account_updated_at
    BEFORE UPDATE ON company_account_manage
    FOR EACH ROW
    EXECUTE FUNCTION update_snake_case_updated_at();
