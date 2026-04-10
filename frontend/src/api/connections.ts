import { apiGet, apiPost } from "./client";

export type SourceConnection = {
  id: number;
  connection_name: string;
  db_type: string;
  host: string;
  port: number;
  database_name?: string | null;
  service_name?: string | null;
  username: string;
  is_active: boolean;
  is_enabled: boolean;
};

export type CreateSourceConnectionPayload = {
  connection_name: string;
  db_type: string;
  host: string;
  port: number;
  database_name?: string | null;
  service_name?: string | null;
  username: string;
  password_plain: string;
  is_active?: boolean;
  is_enabled?: boolean;
};

export function getConnections() {
  return apiGet<SourceConnection[]>("/connections");
}

export function createConnection(body: CreateSourceConnectionPayload) {
  return apiPost<SourceConnection>("/connections", body);
}

export async function testConnection(connectionId: number) {
  const res = await fetch(`http://localhost:8000/connections/${connectionId}/test`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`POST /connections/${connectionId}/test failed: ${res.status}`);
  }

  return res.json();
}

export async function deleteConnection(connectionId: number) {
  const res = await fetch(`http://localhost:8000/connections/${connectionId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`DELETE /connections/${connectionId} failed: ${res.status}`);
  }

  return res.json();
}