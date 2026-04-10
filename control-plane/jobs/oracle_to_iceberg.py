import argparse
from pyspark.sql import SparkSession


def parse_args():
    parser = argparse.ArgumentParser()

    parser.add_argument("--source-schema", required=True)
    parser.add_argument("--source-table", required=True)
    parser.add_argument("--target-catalog", required=True)
    parser.add_argument("--target-schema", required=True)
    parser.add_argument("--target-table", required=True)
    parser.add_argument("--date-column", required=True)
    parser.add_argument("--from-datadate", required=True)
    parser.add_argument("--to-datadate", required=True)

    parser.add_argument("--oracle-host", required=True)
    parser.add_argument("--oracle-port", required=True)
    parser.add_argument("--oracle-service", required=True)
    parser.add_argument("--oracle-user", required=True)
    parser.add_argument("--oracle-password", required=True)

    return parser.parse_args()


def main():
    args = parse_args()

    spark = (
        SparkSession.builder.appName("OracleToIceberg")
        .config("spark.sql.extensions", "org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions")
        .config("spark.sql.catalog.lakehouse", "org.apache.iceberg.spark.SparkCatalog")
        .config("spark.sql.catalog.lakehouse.type", "hive")
        .config("spark.sql.catalog.lakehouse.uri", "thrift://metastore:9083")
        .config("spark.sql.catalog.lakehouse.warehouse", "s3a://warehouse/")
        .config("spark.hadoop.fs.s3a.endpoint", "http://minio:9000")
        .config("spark.hadoop.fs.s3a.access.key", "minio")
        .config("spark.hadoop.fs.s3a.secret.key", "minio123")
        .config("spark.hadoop.fs.s3a.path.style.access", "true")
        .config("spark.hadoop.fs.s3a.connection.ssl.enabled", "false")
        .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem")
        .getOrCreate()
    )

    jdbc_url = f"jdbc:oracle:thin:@//{args.oracle_host}:{args.oracle_port}/{args.oracle_service}"

    query = f"""
        (SELECT *
         FROM {args.source_schema}.{args.source_table}
         WHERE {args.date_column} BETWEEN {args.from_datadate} AND {args.to_datadate}
        ) src
    """

    print("Reading from Oracle...")
    df = (
        spark.read.format("jdbc")
        .option("url", jdbc_url)
        .option("dbtable", query)
        .option("user", args.oracle_user)
        .option("password", args.oracle_password)
        .option("driver", "oracle.jdbc.OracleDriver")
        .load()
    )

    source_count = df.count()
    print(f"Source rows: {source_count}")

    target_full = f"{args.target_catalog}.{args.target_schema}.{args.target_table}"

    spark.sql(f"CREATE SCHEMA IF NOT EXISTS {args.target_catalog}.{args.target_schema}")

    # check table exists
    tables = spark.sql(f"SHOW TABLES IN {args.target_catalog}.{args.target_schema}") \
        .filter(f"tableName = '{args.target_table}'") \
        .count()

    if tables > 0:
        print("Table exists → deleting old range")
        spark.sql(f"""
            DELETE FROM {target_full}
            WHERE {args.date_column} BETWEEN {args.from_datadate} AND {args.to_datadate}
        """)

        df.writeTo(target_full).append()

    else:
        print("Table does not exist → creating new Iceberg table")
        df.writeTo(target_full).create()

    target_count = spark.sql(f"""
        SELECT COUNT(*) FROM {target_full}
        WHERE {args.date_column} BETWEEN {args.from_datadate} AND {args.to_datadate}
    """).collect()[0][0]

    print(f"Target rows: {target_count}")

    if source_count != target_count:
        raise Exception(f"Row count mismatch: source={source_count}, target={target_count}")

    print("Job SUCCESS")
    spark.stop()


if __name__ == "__main__":
    main()