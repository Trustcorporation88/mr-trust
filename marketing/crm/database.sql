-- MEISHOP CRM - Database Schema
-- PostgreSQL 14+

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- 1. USERS & COMPANIES
-- ============================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE,
    website VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(50),
    subscription_plan VARCHAR(50) DEFAULT 'starter_299',
    subscription_start DATE,
    subscription_end DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'rep',
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- 2. CUSTOMERS
-- ============================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    cpf_cnpj VARCHAR(14),
    segment VARCHAR(100),
    industry VARCHAR(100),
    location VARCHAR(255),
    country VARCHAR(2) DEFAULT 'BR',
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    health_score INTEGER DEFAULT 50,
    csat INTEGER,
    lifetime_value DECIMAL(15,2) DEFAULT 0,
    date_entered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_interaction TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_company ON customers(company_id);
CREATE INDEX idx_customers_owner ON customers(owner_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers USING GIN (name gin_trgm_ops);

-- ============================================
-- 3. DEALS / OPPORTUNITIES
-- ============================================

CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    stage VARCHAR(100) DEFAULT 'prospecção',
    probability INTEGER DEFAULT 50,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    expected_close_date DATE,
    actual_close_date DATE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'open',
    loss_reason VARCHAR(255),
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deals_company ON deals(company_id);
CREATE INDEX idx_deals_customer ON deals(customer_id);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_status ON deals(status);

-- ============================================
-- 4. TICKETS / SUPPORT
-- ============================================

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'dúvida',
    priority VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open',
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    sla_hours INTEGER,
    due_date TIMESTAMP,
    resolved_at TIMESTAMP,
    csat_rating INTEGER,
    csat_comment TEXT,
    internal_notes TEXT,
    channel VARCHAR(50),
    channel_message_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_company ON tickets(company_id);
CREATE INDEX idx_tickets_customer ON tickets(customer_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);

-- ============================================
-- 5. CAMPAIGNS / MARKETING
-- ============================================

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100),
    channel VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(50) DEFAULT 'planned',
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    leads_generated INTEGER DEFAULT 0,
    leads_qualified INTEGER DEFAULT 0,
    opportunities_created INTEGER DEFAULT 0,
    customers_acquired INTEGER DEFAULT 0,
    revenue_attributed DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_company ON campaigns(company_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- ============================================
-- 6. INTERACTIONS / COMMUNICATION LOG
-- ============================================

CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(50),
    subject VARCHAR(255),
    content TEXT,
    initiated_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    duration_minutes INTEGER,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interactions_company ON interactions(company_id);
CREATE INDEX idx_interactions_customer ON interactions(customer_id);
CREATE INDEX idx_interactions_deal ON interactions(deal_id);
CREATE INDEX idx_interactions_ticket ON interactions(ticket_id);

-- ============================================
-- 7. AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    action VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id VARCHAR(36),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- ============================================
-- 8. FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log audits
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (company_id, action, entity_type, entity_id, old_values, new_values)
        VALUES (
            COALESCE(NEW.company_id, OLD.company_id),
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id::TEXT,
            row_to_json(OLD),
            row_to_json(NEW)
        );
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (company_id, action, entity_type, entity_id, new_values)
        VALUES (
            NEW.company_id,
            'INSERT',
            TG_TABLE_NAME,
            NEW.id::TEXT,
            row_to_json(NEW)
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (company_id, action, entity_type, entity_id, old_values)
        VALUES (
            OLD.company_id,
            'DELETE',
            TG_TABLE_NAME,
            OLD.id::TEXT,
            row_to_json(OLD)
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for important tables
CREATE TRIGGER audit_customers AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_deals AFTER INSERT OR UPDATE OR DELETE ON deals
    FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_tickets AFTER INSERT OR UPDATE OR DELETE ON tickets
    FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- INITIAL DATA (EXAMPLE)
-- ============================================

INSERT INTO companies (name, cnpj, website, subscription_plan)
VALUES (
    'MEISHOP Teste',
    '00000000000001',
    'www.meishop.com.br',
    'recommended_899'
);
