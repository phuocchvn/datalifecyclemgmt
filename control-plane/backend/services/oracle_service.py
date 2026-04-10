import oracledb


def safe_ident(name: str) -> str:
    if not name:
        raise ValueError("Identifier is empty")

    allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$#"
    upper_name = name.upper()

    if any(ch not in allowed for ch in upper_name):
        raise ValueError(f"Invalid identifier: {name}")

    return upper_name


def build_oracle_dsn(host: str, port: int, service_name: str | None):
    if not service_name:
        raise ValueError("Oracle service_name is required")
    return f"{host}:{port}/{service_name}"


def get_connection(source_connection):
    dsn = build_oracle_dsn(
        host=source_connection.host,
        port=source_connection.port,
        service_name=source_connection.service_name,
    )

    return oracledb.connect(
        user=source_connection.username,
        password=source_connection.password_plain,
        dsn=dsn,
    )


def list_schemas(source_connection):
    conn = get_connection(source_connection)
    cur = conn.cursor()

    cur.execute("""
        SELECT username
        FROM all_users
        ORDER BY username
    """)

    rows = [r[0] for r in cur.fetchall()]

    cur.close()
    conn.close()
    return rows


def list_tables(source_connection, schema: str):
    schema = safe_ident(schema)

    conn = get_connection(source_connection)
    cur = conn.cursor()

    cur.execute("""
        SELECT table_name
        FROM all_tables
        WHERE owner = :p_schema
        ORDER BY table_name
    """, {"p_schema": schema})

    rows = [r[0] for r in cur.fetchall()]

    cur.close()
    conn.close()
    return rows


def list_columns(source_connection, schema: str, table: str):
    schema = safe_ident(schema)
    table = safe_ident(table)

    conn = get_connection(source_connection)
    cur = conn.cursor()

    cur.execute("""
        SELECT column_name
        FROM all_tab_columns
        WHERE owner = :p_schema
          AND table_name = :p_table
        ORDER BY column_id
    """, {"p_schema": schema, "p_table": table})

    rows = [r[0] for r in cur.fetchall()]

    cur.close()
    conn.close()
    return rows


def get_datadate_range(source_connection, schema: str, table: str, date_column: str):
    schema = safe_ident(schema)
    table = safe_ident(table)
    date_column = safe_ident(date_column)

    conn = get_connection(source_connection)
    cur = conn.cursor()

    query = f"""
        SELECT
            MIN({date_column}) AS min_datadate,
            MAX({date_column}) AS max_datadate
        FROM {schema}.{table}
        WHERE {date_column} IS NOT NULL
    """

    cur.execute(query)
    row = cur.fetchone()

    cur.close()
    conn.close()

    return {
        "min_datadate": row[0],
        "max_datadate": row[1],
    }