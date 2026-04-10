-- =========================================================
-- CONTROL PLANE METADATA DATABASE
-- =========================================================

-- ================================
-- 1. SOURCE CONNECTIONS
-- ================================
CREATE TABLE IF NOT EXISTS source_connections (
    id BIGSERIAL PRIMARY KEY,
    connection_name VARCHAR(255) NOT NULL UNIQUE,
    db_type VARCHAR(50) NOT NULL,               -- Oracle / MSSQL / PostgreSQL / Netezza
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    database_name VARCHAR(255),
    service_name VARCHAR(255),                  -- dùng cho Oracle
    username VARCHAR(255) NOT NULL,
    password_plain VARCHAR(255) NOT NULL,       -- demo only (prod phải encrypt)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- 2. OFFLOAD JOBS (tracking)
-- ================================
CREATE TABLE IF NOT EXISTS offload_jobs (
    job_id UUID PRIMARY KEY,
    connection_id BIGINT NOT NULL REFERENCES source_connections(id),

    source_schema VARCHAR(255) NOT NULL,
    source_table VARCHAR(255) NOT NULL,

    target_catalog VARCHAR(255) NOT NULL,
    target_schema VARCHAR(255) NOT NULL,
    target_table VARCHAR(255) NOT NULL,

    date_column VARCHAR(255) NOT NULL,

    from_datadate INTEGER,
    to_datadate INTEGER,

    status VARCHAR(50) NOT NULL,                -- PENDING / RUNNING / SUCCESS / FAILED

    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    started_at TIMESTAMP,
    finished_at TIMESTAMP,

    source_row_count BIGINT,
    target_row_count BIGINT,

    error_message TEXT
);

-- ================================
-- 3. OFFLOAD JOB LOGS
-- ================================
CREATE TABLE IF NOT EXISTS offload_job_logs (
    id BIGSERIAL PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES offload_jobs(job_id),
    log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    log_level VARCHAR(20),                     -- INFO / ERROR
    message TEXT
);

-- ================================
-- 4. INVENTORY CACHE (optional)
-- ================================
CREATE TABLE IF NOT EXISTS inventory_cache (
    id BIGSERIAL PRIMARY KEY,
    connection_id BIGINT NOT NULL REFERENCES source_connections(id),
    schema_name VARCHAR(255),
    table_name VARCHAR(255),

    last_refreshed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- 5. COVERAGE SNAPSHOT (optional)
-- ================================
CREATE TABLE IF NOT EXISTS coverage_snapshot (
    id BIGSERIAL PRIMARY KEY,
    connection_id BIGINT NOT NULL REFERENCES source_connections(id),

    schema_name VARCHAR(255),
    table_name VARCHAR(255),
    date_column VARCHAR(255),

    oracle_min_datadate INTEGER,
    oracle_max_datadate INTEGER,

    iceberg_min_datadate INTEGER,
    iceberg_max_datadate INTEGER,

    snapshot_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- SEED DATA
-- =========================================================

