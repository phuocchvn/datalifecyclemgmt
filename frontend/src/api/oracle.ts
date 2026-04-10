import { apiGet } from "./client";

export function getOracleSchemas(connectionId: number) {
  return apiGet<string[]>(
    `/oracle/schemas?connection_id=${encodeURIComponent(String(connectionId))}`
  );
}

export function getOracleTables(connectionId: number, schema: string) {
  return apiGet<string[]>(
    `/oracle/schemas/${encodeURIComponent(schema)}/tables?connection_id=${encodeURIComponent(
      String(connectionId)
    )}`
  );
}

export function getOracleColumns(
  connectionId: number,
  schema: string,
  table: string
) {
  return apiGet<string[]>(
    `/oracle/schemas/${encodeURIComponent(schema)}/tables/${encodeURIComponent(
      table
    )}/columns?connection_id=${encodeURIComponent(String(connectionId))}`
  );
}