import { useEffect, useState } from "react";
import {
  getOracleSchemas,
  getOracleTables,
  getOracleColumns,
} from "../api/oracle";

type TableSelectorProps = {
  connectionId: number;
  schema: string;
  table: string;
  dateColumn: string;
  coverage: any;

  onSchemaChange: (schema: string) => void;
  onTableChange: (table: string) => void;
  onDateColumnChange: (dateColumn: string) => void;
};

export default function TableSelector({
  connectionId,
  schema,
  table,
  dateColumn,
  coverage,
  onSchemaChange,
  onTableChange,
  onDateColumnChange,
}: TableSelectorProps) {
  const [schemas, setSchemas] = useState<string[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const [loadingSchemas, setLoadingSchemas] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(false);

  const [errorSchemas, setErrorSchemas] = useState("");
  const [errorTables, setErrorTables] = useState("");
  const [errorColumns, setErrorColumns] = useState("");

  // ================================
  // LOAD SCHEMAS
  // ================================
  useEffect(() => {
    if (!connectionId) return;

    async function loadSchemas() {
      setLoadingSchemas(true);
      setErrorSchemas("");

      try {
        const data = await getOracleSchemas(connectionId);
        setSchemas(data);
      } catch (e) {
        setSchemas([]);
        setErrorSchemas("Không tải được schemas");
      } finally {
        setLoadingSchemas(false);
      }
    }

    loadSchemas();
  }, [connectionId]);

  // ================================
  // LOAD TABLES
  // ================================
  useEffect(() => {
    if (!connectionId || !schema) return;

    async function loadTables() {
      setLoadingTables(true);
      setErrorTables("");

      try {
        const data = await getOracleTables(connectionId, schema);
        setTables(data);
      } catch (e) {
        setTables([]);
        setErrorTables("Không tải được tables");
      } finally {
        setLoadingTables(false);
      }
    }

    loadTables();
  }, [connectionId, schema]);

  // ================================
  // LOAD COLUMNS
  // ================================
  useEffect(() => {
    if (!connectionId || !schema || !table) return;

    async function loadColumns() {
      setLoadingColumns(true);
      setErrorColumns("");

      try {
        const data = await getOracleColumns(connectionId, schema, table);
        setColumns(data);
      } catch (e) {
        setColumns([]);
        setErrorColumns("Không tải được columns");
      } finally {
        setLoadingColumns(false);
      }
    }

    loadColumns();
  }, [connectionId, schema, table]);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Source Table Selector
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Chọn schema → table → date column (DATADATE) để xác định phạm vi dữ liệu.
      </p>

      <div className="mt-5 grid gap-4">
        {/* ================= SCHEMA ================= */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Schema
          </label>

          {loadingSchemas ? (
            <div className="text-sm text-slate-500">Loading schemas...</div>
          ) : errorSchemas ? (
            <div className="text-sm text-red-600">{errorSchemas}</div>
          ) : (
            <select
              value={schema}
              onChange={(e) => onSchemaChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select schema</option>
              {schemas.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ================= TABLE ================= */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Table
          </label>

          {loadingTables ? (
            <div className="text-sm text-slate-500">Loading tables...</div>
          ) : errorTables ? (
            <div className="text-sm text-red-600">{errorTables}</div>
          ) : (
            <select
              value={table}
              onChange={(e) => onTableChange(e.target.value)}
              disabled={!schema}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select table</option>
              {tables.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ================= DATE COLUMN ================= */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Date Column
          </label>

          {loadingColumns ? (
            <div className="text-sm text-slate-500">Loading columns...</div>
          ) : errorColumns ? (
            <div className="text-sm text-red-600">{errorColumns}</div>
          ) : (
            <select
              value={dateColumn}
              onChange={(e) => onDateColumnChange(e.target.value)}
              disabled={!table}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select column</option>
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ================= COVERAGE QUICK VIEW ================= */}
        {coverage && (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Oracle</span>
              <span className="text-slate-900">
                {coverage?.oracle?.min_date_display} →{" "}
                {coverage?.oracle?.max_date_display}
              </span>
            </div>

            <div className="mt-2 flex justify-between">
              <span className="text-slate-600">Iceberg</span>
              <span className="text-slate-900">
                {coverage?.iceberg?.exists
                  ? `${coverage?.iceberg?.min_date_display} → ${coverage?.iceberg?.max_date_display}`
                  : "Chưa có bảng"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}