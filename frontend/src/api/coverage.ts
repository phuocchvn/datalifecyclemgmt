import { apiGet } from "./client";

export function getCoverage(
  connectionId: number,
  schema: string,
  table: string,
  dateColumn: string
) {
  return apiGet<any>(
    `/coverage?connection_id=${encodeURIComponent(
      String(connectionId)
    )}&schema=${encodeURIComponent(schema)}&table=${encodeURIComponent(
      table
    )}&date_column=${encodeURIComponent(dateColumn)}`
  );
}