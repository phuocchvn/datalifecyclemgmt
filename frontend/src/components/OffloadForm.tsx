import { useEffect, useState } from "react";
import { submitOffload } from "../api/jobs";

type OffloadFormProps = {
  connectionId: number;
  schema: string;
  table: string;
  dateColumn: string;
  coverage: any;
};

export default function OffloadForm({
  connectionId,
  schema,
  table,
  dateColumn,
  coverage,
}: OffloadFormProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const allowedMin = coverage?.allowed_offload_window?.min_date ?? "";
  const allowedMax = coverage?.allowed_offload_window?.max_date ?? "";
  const windowMessage = coverage?.allowed_offload_window?.message ?? "";

  useEffect(() => {
    setFromDate(allowedMin || "");
    setToDate(allowedMax || "");
  }, [allowedMin, allowedMax]);

  function messageClass(type: "success" | "error" | "info") {
    if (type === "success") return "bg-emerald-50 text-emerald-700";
    if (type === "error") return "bg-red-50 text-red-700";
    return "bg-slate-100 text-slate-700";
  }

  async function handleSubmit() {
    setSubmitting(true);
    setMessage(null);

    try {
      const data = await submitOffload({
        connection_id: connectionId,
        source_schema: schema,
        source_table: table,
        date_column: dateColumn,
        from_date: fromDate,
        to_date: toDate,
        submitted_by: "admin",
      });

      setMessage({
        type: "success",
        text: `Submit job thành công. Job ID: ${data.job_id} | Status: ${data.status}`,
      });
    } catch {
      setMessage({
        type: "error",
        text: "Submit offload thất bại",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const submitDisabled =
    submitting ||
    !connectionId ||
    !schema ||
    !table ||
    !dateColumn ||
    !fromDate ||
    !toDate ||
    !allowedMin ||
    !allowedMax;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Offload Job</h2>
      <p className="mt-1 text-sm text-slate-500">
        Chọn khoảng thời gian hợp lệ để offload dữ liệu từ Oracle sang Iceberg.
      </p>

      {allowedMin && allowedMax && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
          Cửa sổ offload hợp lệ:{" "}
          <span className="font-medium">{allowedMin}</span> →{" "}
          <span className="font-medium">{allowedMax}</span>
        </div>
      )}

      {windowMessage && (
        <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-700">
          {windowMessage}
        </div>
      )}

      {message && (
        <div
          className={`mt-4 rounded-2xl p-3 text-sm ${messageClass(
            message.type
          )}`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            From date
          </label>
          <input
            type="date"
            value={fromDate}
            min={allowedMin || undefined}
            max={allowedMax || undefined}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            To date
          </label>
          <input
            type="date"
            value={toDate}
            min={allowedMin || undefined}
            max={allowedMax || undefined}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Connection ID
          </label>
          <input
            value={connectionId}
            readOnly
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Source Table
          </label>
          <input
            value={`${schema}.${table}`}
            readOnly
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Date Column
          </label>
          <input
            value={dateColumn}
            readOnly
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitDisabled}
        className="mt-4 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Offload Job"}
      </button>
    </div>
  );
}