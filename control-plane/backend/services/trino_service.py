import trino

from config import TRINO_HOST, TRINO_PORT, TRINO_USER, TRINO_CATALOG


def get_connection():
    return trino.dbapi.connect(
        host=TRINO_HOST,
        port=TRINO_PORT,
        user=TRINO_USER,
        catalog=TRINO_CATALOG,
    )


def safe_ident(name: str) -> str:
    if not name:
        raise ValueError("Identifier is empty")

    allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$"
    if any(ch not in allowed for ch in name):
        raise ValueError(f"Invalid identifier: {name}")

    return name


def table_exists(schema: str, table: str) -> bool:
    schema = safe_ident(schema)
    table = safe_ident(table)

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(f"SHOW TABLES FROM {schema}")
    rows = [r[0] for r in cur.fetchall()]

    cur.close()
    conn.close()

    return table in rows


def get_datadate_range(schema: str, table: str, date_column: str):
    schema = safe_ident(schema)
    table = safe_ident(table)
    date_column = safe_ident(date_column)

    conn = get_connection()
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