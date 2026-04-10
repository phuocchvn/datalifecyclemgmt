import { useEffect, useState } from "react";
import { getCoverage } from "../api/coverage";
import { getConnections, type SourceConnection } from "../api/connections";
import OffloadForm from "../components/OffloadForm";
import TableSelector from "../components/TableSelector";
import TargetTableCard from "../components/TargetTableCard";
import CoverageTimeline from "../components/CoverageTimeline";

export default function InventoryPage() {
  const [connections, setConnections] = useState<SourceConnection[]>([]);
  const [connectionId, setConnectionId] = useState<number | "">("");

  const [schema, setSchema] = useState("");
  const [table, setTable] = useState("");
  const [dateColumn, setDateColumn] = useState("");

  const [coverage, setCoverage] = useState<any>(null);
  const [loadingCoverage, setLoadingCoverage] = useState(false);
  const [coverageError, setCoverageError] = useState("");

  useEffect(() => {
    async function loadConnections() {
      try {
        const data = await getConnections();
        const oracleConnections = data.filter(
          (c) => c.db_type === "Oracle" && c.is_enabled
        );

        setConnections(oracleConnections);

        if (oracleConnections.length > 0) {
          setConnectionId(oracleConnections[0].id);
        }
      } catch {
        setConnections([]);
      }
    }

    loadConnections();
  }, []);

  useEffect(() => {
    if (!connectionId || !schema || !table || !dateColumn) return;

    async function loadCoverage() {
      setLoadingCoverage(true);
      setCoverageError("");

      try {
        const data = await getCoverage(
          Number(connectionId),
          schema,
          table,
          dateColumn
        );
        setCoverage(data);
      } catch {
        setCoverage(null);
        setCoverageError("Không tải được coverage");
      } finally {
        setLoadingCoverage(false);
      }
    }

    loadCoverage();
  }, [connectionId, schema, table, dateColumn]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          Data Lifecycle Control Plane
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Browse source inventory and prepare Oracle → Iceberg offload.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Selected Connection
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Chọn source connection trước khi duyệt schema và table.
        </p>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Connection
          </label>
          <select
            value={connectionId}
            onChange={(e) => {
              setConnectionId(Number(e.target.value));
              setSchema("");
              setTable("");
              setDateColumn("");
              setCoverage(null);
              setCoverageError("");
            }}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            {connections.length === 0 && (
              <option value="">No Oracle connection</option>
            )}
            {connections.map((conn) => (
              <option key={conn.id} value={conn.id}>
                {conn.connection_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {connectionId && (
        <div className="grid gap-6 xl:grid-cols-2">
          <TableSelector
            connectionId={Number(connectionId)}
            schema={schema}
            table={table}
            dateColumn={dateColumn}
            coverage={coverage}
            onSchemaChange={(value) => {
              setSchema(value);
              setTable("");
              setDateColumn("");
              setCoverage(null);
              setCoverageError("");
            }}
            onTableChange={(value) => {
              setTable(value);
              setDateColumn("");
              setCoverage(null);
              setCoverageError("");
            }}
            onDateColumnChange={(value) => {
              setDateColumn(value);
              setCoverage(null);
              setCoverageError("");
            }}
          />

          {schema && table && dateColumn && (
            <TargetTableCard
              sourceSchema={schema}
              sourceTable={table}
              coverage={coverage}
            />
          )}
        </div>
      )}

      {loadingCoverage && (
        <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">
          Đang tải coverage...
        </div>
      )}

      {coverageError && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {coverageError}
        </div>
      )}

      {schema && table && dateColumn && <CoverageTimeline coverage={coverage} />}

      {schema && table && dateColumn && connectionId && (
        <OffloadForm
          connectionId={Number(connectionId)}
          schema={schema}
          table={table}
          dateColumn={dateColumn}
          coverage={coverage}
        />
      )}
    </div>
  );
}