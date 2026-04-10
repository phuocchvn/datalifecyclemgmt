from datetime import datetime, timedelta

from services.oracle_service import get_datadate_range as oracle_range
from services.trino_service import (
    get_datadate_range as iceberg_range,
    table_exists as iceberg_table_exists,
)


def datadate_to_iso(datadate):
    if datadate is None:
        return None

    s = str(datadate)
    if len(s) != 8:
        return None

    return f"{s[0:4]}-{s[4:6]}-{s[6:8]}"


def iso_to_datadate(value: str | None):
    if value is None:
        return None
    return int(value.replace("-", ""))


def add_one_day(iso_date: str | None):
    if iso_date is None:
        return None

    dt = datetime.strptime(iso_date, "%Y-%m-%d").date()
    return (dt + timedelta(days=1)).isoformat()


def build_allowed_offload_window(oracle_payload, iceberg_payload):
    oracle_min = oracle_payload["min_date_display"]
    oracle_max = oracle_payload["max_date_display"]

    if oracle_min is None or oracle_max is None:
        return {
            "min_date": None,
            "max_date": None,
            "min_datadate": None,
            "max_datadate": None,
            "message": "Oracle source không có dữ liệu để offload.",
        }

    if not iceberg_payload["exists"] or iceberg_payload["max_date_display"] is None:
        return {
            "min_date": oracle_min,
            "max_date": oracle_max,
            "min_datadate": iso_to_datadate(oracle_min),
            "max_datadate": iso_to_datadate(oracle_max),
            "message": None,
        }

    allowed_min = add_one_day(iceberg_payload["max_date_display"])
    allowed_max = oracle_max

    if allowed_min is None or allowed_max is None:
        return {
            "min_date": None,
            "max_date": None,
            "min_datadate": None,
            "max_datadate": None,
            "message": "Không tính được cửa sổ offload hợp lệ.",
        }

    if allowed_min > allowed_max:
        return {
            "min_date": None,
            "max_date": None,
            "min_datadate": None,
            "max_datadate": None,
            "message": "Không còn cửa sổ offload hợp lệ. Iceberg đã bao phủ hết range hiện có trên Oracle.",
        }

    return {
        "min_date": allowed_min,
        "max_date": allowed_max,
        "min_datadate": iso_to_datadate(allowed_min),
        "max_datadate": iso_to_datadate(allowed_max),
        "message": None,
    }


def get_coverage(source_connection, schema: str, table: str, date_column: str):
    source = oracle_range(
        source_connection,
        schema.upper(),
        table.upper(),
        date_column.upper(),
    )

    oracle_payload = {
        "exists": True,
        **source,
        "min_date_display": datadate_to_iso(source["min_datadate"]),
        "max_date_display": datadate_to_iso(source["max_datadate"]),
        "message": None,
    }

    iceberg_schema = schema.lower()
    iceberg_table = table.lower()
    iceberg_date_column = date_column.lower()

    if iceberg_table_exists(iceberg_schema, iceberg_table):
        try:
            target = iceberg_range(
                iceberg_schema,
                iceberg_table,
                iceberg_date_column,
            )

            iceberg_payload = {
                "exists": True,
                **target,
                "min_date_display": datadate_to_iso(target["min_datadate"]),
                "max_date_display": datadate_to_iso(target["max_datadate"]),
                "message": None,
            }
        except Exception:
            iceberg_payload = {
                "exists": True,
                "min_datadate": None,
                "max_datadate": None,
                "min_date_display": None,
                "max_date_display": None,
                "message": "Không đọc được coverage của bảng Cold.",
            }
    else:
        iceberg_payload = {
            "exists": False,
            "min_datadate": None,
            "max_datadate": None,
            "min_date_display": None,
            "max_date_display": None,
            "message": "Bảng này chưa có trên vùng Cold. Hệ thống sẽ tự động tạo mới khi offload lần đầu.",
        }

    allowed_offload_window = build_allowed_offload_window(
        oracle_payload, iceberg_payload
    )

    return {
        "oracle": oracle_payload,
        "iceberg": iceberg_payload,
        "allowed_offload_window": allowed_offload_window,
    }