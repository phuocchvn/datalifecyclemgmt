import { apiGet, apiPost } from "./client";

export function submitOffload(body: {
  connection_id: number;
  source_schema: string;
  source_table: string;
  date_column: string;
  from_date: string;
  to_date: string;
  submitted_by?: string;
}) {
  return apiPost<{ job_id: string; status: string }>("/offload", body);
}

export type JobItem = {
  job_id: string;
  connection_id: number;
  source_schema: string;
  source_table: string;
  target_catalog: string;
  target_schema: string;
  target_table: string;
  date_column: string;
  from_datadate: number | null;
  to_datadate: number | null;
  status: string;
  submitted_by: string | null;
  submitted_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  source_row_count: number | null;
  target_row_count: number | null;
  error_message: string | null;
};

export type JobLogItem = {
  id: number;
  job_id: string;
  log_time: string | null;
  log_level: string | null;
  message: string | null;
};

export function getJobs() {
  return apiGet<JobItem[]>("/jobs");
}

export function getJob(jobId: string) {
  return apiGet<JobItem>(`/jobs/${jobId}`);
}

export function getJobLogs(jobId: string) {
  return apiGet<JobLogItem[]>(`/jobs/${jobId}/logs`);
}