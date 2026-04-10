CREATE TABLE IF NOT EXISTS table_configs (
    id BIGSERIAL PRIMARY KEY,
    source_schema VARCHAR(128) NOT NULL,
    source_table VARCHAR(128) NOT NULL,
    target_catalog VARCHAR(128) NOT NULL DEFAULT 'iceberg',
    target_schema VARCHAR(128) NOT NULL,
    target_table VARCHAR(128) NOT NULL,
    date_column VARCHAR(128) NOT NULL DEFAULT 'DATADATE',
    offload_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (source_schema, source_table)
);

CREATE TABLE IF NOT EXISTS table_coverage (
    id BIGSERIAL PRIMARY KEY,
    source_schema VARCHAR(128) NOT NULL,
    source_table VARCHAR(128) NOT NULL,
    source_min_date DATE,
    source_max_date DATE,
    target_min_date DATE,
    target_max_date DATE,
    refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (source_schema, source_table)
);

DROP TABLE offload_jobs;

CREATE TABLE IF NOT EXISTS offload_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_uuid UUID NOT NULL UNIQUE,
    source_schema VARCHAR(128) NOT NULL,
    source_table VARCHAR(128) NOT NULL,
    target_schema VARCHAR(128) NOT NULL,
    target_table VARCHAR(128) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    source_row_count BIGINT,
    target_row_count BIGINT,
    spark_app_id VARCHAR(128),
    error_message TEXT,
    submitted_by VARCHAR(128),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    finished_at TIMESTAMP
);
