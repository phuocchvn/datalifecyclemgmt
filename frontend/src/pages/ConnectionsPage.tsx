import { useEffect, useState } from "react";
import {
  createConnection,
  deleteConnection,
  getConnections,
  testConnection,
  type CreateSourceConnectionPayload,
  type SourceConnection,
} from "../api/connections";

function badgeClass(enabled: boolean, dbType: string) {
  if (!enabled) return "bg-slate-100 text-slate-600";
  if (dbType === "Oracle") return "bg-emerald-50 text-emerald-700";
  return "bg-slate-100 text-slate-700";
}

function messageClass(type: "success" | "error" | "info") {
  if (type === "success") return "bg-emerald-50 text-emerald-700";
  if (type === "error") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-700";
}

const DB_OPTIONS = [
  { value: "Oracle", enabled: true },
  { value: "MSSQL Server", enabled: false },
  { value: "PostgreSQL", enabled: false },
  { value: "Netezza", enabled: false },
];

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<SourceConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [testingId, setTestingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [form, setForm] = useState<CreateSourceConnectionPayload>({
    connection_name: "",
    db_type: "Oracle",
    host: "",
    port: 1521,
    database_name: "",
    service_name: "XEPDB1",
    username: "",
    password_plain: "",
    is_active: true,
    is_enabled: true,
  });

  async function loadConnections() {
    setLoading(true);
    setError("");
    try {
      const data = await getConnections();
      setConnections(data);
    } catch {
      setError("Không tải được danh sách connections");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConnections();
  }, []);

  function onChange<K extends keyof CreateSourceConnectionPayload>(
    key: K,
    value: CreateSourceConnectionPayload[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      await createConnection({
        ...form,
        database_name: form.database_name || null,
        service_name: form.service_name || null,
      });

      setMessage({ type: "success", text: "Tạo connection thành công" });
      setShowForm(false);
      setForm({
        connection_name: "",
        db_type: "Oracle",
        host: "",
        port: 1521,
        database_name: "",
        service_name: "XEPDB1",
        username: "",
        password_plain: "",
        is_active: true,
        is_enabled: true,
      });

      await loadConnections();
    } catch {
      setMessage({ type: "error", text: "Tạo connection thất bại" });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest(connectionId: number) {
    setTestingId(connectionId);
    setMessage(null);

    try {
      const result = await testConnection(connectionId);
      setMessage({
        type: result.ok ? "success" : "error",
        text:
          result.message ??
          (result.ok
            ? "Test connection thành công"
            : "Test connection thất bại"),
      });
    } catch {
      setMessage({ type: "error", text: "Test connection thất bại" });
    } finally {
      setTestingId(null);
    }
  }

  async function handleDelete(connectionId: number, connectionName: string) {
    const confirmed = window.confirm(`Xóa connection "${connectionName}"?`);
    if (!confirmed) return;

    setDeletingId(connectionId);
    setMessage(null);

    try {
      await deleteConnection(connectionId);
      setMessage({ type: "success", text: "Xóa connection thành công" });
      await loadConnections();
    } catch {
      setMessage({ type: "error", text: "Xóa connection thất bại" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Connections
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Khai báo và quản lý kết nối nguồn dữ liệu dùng cho inventory và offload.
            </p>
          </div>

          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            {showForm ? "Hide Form" : "Add Connection"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-2xl p-4 text-sm shadow-sm ${messageClass(
            message.type
          )}`}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Source Connections
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Oracle dùng được ngay. Các DB khác đang để mở rộng sau.
        </p>

        {loading ? (
          <div className="mt-4 text-sm text-slate-500">Đang tải...</div>
        ) : error ? (
          <div className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">DB Type</th>
                  <th className="px-4 py-3 font-medium">Host</th>
                  <th className="px-4 py-3 font-medium">Port</th>
                  <th className="px-4 py-3 font-medium">Database / Service</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {connections.map((conn) => (
                  <tr key={conn.id} className={!conn.is_enabled ? "opacity-60" : ""}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {conn.connection_name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{conn.db_type}</td>
                    <td className="px-4 py-3 text-slate-700">{conn.host}</td>
                    <td className="px-4 py-3 text-slate-700">{conn.port}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {conn.service_name || conn.database_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{conn.username}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(
                          conn.is_enabled,
                          conn.db_type
                        )}`}
                      >
                        {conn.is_enabled ? "Active" : "Coming soon"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTest(conn.id)}
                          disabled={testingId === conn.id}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 disabled:opacity-50"
                        >
                          {testingId === conn.id ? "Testing..." : "Test"}
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(conn.id, conn.connection_name)
                          }
                          disabled={deletingId === conn.id}
                          className="rounded-xl border border-red-200 px-3 py-1.5 text-xs text-red-700 disabled:opacity-50"
                        >
                          {deletingId === conn.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {connections.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-sm text-slate-500"
                    >
                      Chưa có connection nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            New Connection
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Form tạo source connection mới
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Connection Name
              </label>
              <input
                value={form.connection_name}
                onChange={(e) => onChange("connection_name", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Oracle DWH"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Database Type
              </label>
              <select
                value={form.db_type}
                onChange={(e) => onChange("db_type", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                {DB_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={!opt.enabled}>
                    {opt.enabled ? opt.value : `${opt.value} (coming soon)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Host
              </label>
              <input
                value={form.host}
                onChange={(e) => onChange("host", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="oracle"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Port
              </label>
              <input
                type="number"
                value={form.port}
                onChange={(e) => onChange("port", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Database Name
              </label>
              <input
                value={form.database_name ?? ""}
                onChange={(e) => onChange("database_name", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Service Name
              </label>
              <input
                value={form.service_name ?? ""}
                onChange={(e) => onChange("service_name", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="XEPDB1"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                User
              </label>
              <input
                value={form.username}
                onChange={(e) => onChange("username", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="dwh"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={form.password_plain}
                onChange={(e) => onChange("password_plain", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Connection"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}