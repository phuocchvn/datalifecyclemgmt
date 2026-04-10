import { useEffect, useState } from "react";
import { getJobLogs, getJobs, type JobItem, type JobLogItem } from "../api/jobs";

function badgeClass(status: string) {
  if (status === "SUCCESS") return "bg-emerald-50 text-emerald-700";
  if (status === "FAILED") return "bg-red-50 text-red-700";
  if (status === "RUNNING") return "bg-amber-50 text-amber-700";
  if (status === "PENDING") return "bg-slate-100 text-slate-700";
  return "bg-slate-100 text-slate-700";
}

function formatRange(fromValue: number | null, toValue: number | null) {
  if (!fromValue || !toValue) return "—";
  return `${fromValue} → ${toValue}`;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [logs, setLogs] = useState<JobLogItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState("");

  async function loadJobs() {
    setLoading(true);
    setError("");

    try {
      const data = await getJobs();
      setJobs(data);

      if (!selectedJob && data.length > 0) {
        setSelectedJob(data[0]);
      } else if (selectedJob) {
        const refreshed = data.find((j) => j.job_id === selectedJob.job_id);
        if (refreshed) setSelectedJob(refreshed);
      }
    } catch {
      setError("Không tải được danh sách jobs");
    } finally {
      setLoading(false);
    }
  }

  async function loadLogs(jobId: string) {
    setLoadingLogs(true);
    try {
      const data = await getJobLogs(jobId);
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (!selectedJob) return;
    loadLogs(selectedJob.job_id);
  }, [selectedJob]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadJobs();
      if (selectedJob) {
        loadLogs(selectedJob.job_id);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [selectedJob]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Jobs</h1>
            <p className="mt-2 text-sm text-slate-600">
              Monitoring và lịch sử các job offload Oracle → Iceberg.
            </p>
          </div>

          <button
            onClick={loadJobs}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Job History</h2>
          <p className="mt-1 text-sm text-slate-500">
            Danh sách các job đã submit.
          </p>

          {loading ? (
            <div className="mt-4 text-sm text-slate-500">Đang tải...</div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Job ID</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Range</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {jobs.map((job) => (
                    <tr
                      key={job.job_id}
                      onClick={() => setSelectedJob(job)}
                      className={`cursor-pointer hover:bg-slate-50 ${
                        selectedJob?.job_id === job.job_id ? "bg-slate-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {job.job_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {job.source_schema}.{job.source_table}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatRange(job.from_datadate, job.to_datadate)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {job.submitted_at
                          ? new Date(job.submitted_at).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}

                  {jobs.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-slate-500"
                      >
                        Chưa có job nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Job Detail</h2>

            {!selectedJob ? (
              <div className="mt-4 text-sm text-slate-500">
                Chọn một job để xem chi tiết
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Job ID:</span>{" "}
                  <span className="text-slate-900">{selectedJob.job_id}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Source:</span>{" "}
                  <span className="text-slate-900">
                    {selectedJob.source_schema}.{selectedJob.source_table}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Target:</span>{" "}
                  <span className="text-slate-900">
                    {selectedJob.target_catalog}.{selectedJob.target_schema}.{selectedJob.target_table}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Date Column:</span>{" "}
                  <span className="text-slate-900">{selectedJob.date_column}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Range:</span>{" "}
                  <span className="text-slate-900">
                    {formatRange(selectedJob.from_datadate, selectedJob.to_datadate)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Status:</span>{" "}
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(
                      selectedJob.status
                    )}`}
                  >
                    {selectedJob.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Submitted by:</span>{" "}
                  <span className="text-slate-900">{selectedJob.submitted_by ?? "—"}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Error:</span>{" "}
                  <span className="text-slate-900">{selectedJob.error_message ?? "—"}</span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Job Logs</h2>

            {loadingLogs ? (
              <div className="mt-4 text-sm text-slate-500">Đang tải logs...</div>
            ) : (
              <div className="mt-4 max-h-[420px] space-y-2 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-slate-100">
                {logs.length === 0 ? (
                  <div className="text-slate-400">Chưa có log</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id}>
                      <span className="text-slate-400">
                        [{log.log_time ? new Date(log.log_time).toLocaleTimeString() : "--:--:--"}]
                      </span>{" "}
                      <span
                        className={
                          log.log_level === "ERROR"
                            ? "text-red-400"
                            : "text-emerald-400"
                        }
                      >
                        {log.log_level ?? "INFO"}
                      </span>{" "}
                      <span>{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}