const mockJobs = [
  {
    id: "job-001",
    table: "DWH.SALES_ORDERS",
    range: "2023-01-01 → 2024-03-11",
    status: "SUCCESS",
  },
  {
    id: "job-002",
    table: "DWH.CUSTOMER_TXN",
    range: "2022-01-01 → 2022-12-31",
    status: "RUNNING",
  },
];

export default function JobHistory() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Job History</h2>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Job ID</th>
              <th className="px-4 py-3 font-medium">Table</th>
              <th className="px-4 py-3 font-medium">Range</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {mockJobs.map((job) => (
              <tr key={job.id}>
                <td className="px-4 py-3">{job.id}</td>
                <td className="px-4 py-3">{job.table}</td>
                <td className="px-4 py-3">{job.range}</td>
                <td className="px-4 py-3">{job.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}