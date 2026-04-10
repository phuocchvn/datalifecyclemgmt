import { archiveRuleRows } from "../data/archiveRuleData";

function rowClass(kind: string) {
  if (kind === "header-1" || kind === "header-2" || kind === "header-3") {
    return "bg-slate-100 font-semibold text-slate-900";
  }

  if (kind === "section") {
    return "bg-sky-50 font-semibold text-sky-900";
  }

  if (kind === "continuation") {
    return "bg-slate-50 text-slate-700";
  }

  return "bg-white text-slate-800";
}

export default function ArchiveRulePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Archive Rule
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Read-only lifecycle retention policy. Full content is displayed from the archive rule workbook.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            Read only
          </span>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Retention Matrix
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Toàn bộ nội dung từ file Excel Archive Rule.
        </p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1600px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500">
                <th className="border-b border-slate-200 px-4 py-3 font-medium">STT</th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">Phân loại mức 1</th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">Phân loại mức 2</th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">Định nghĩa</th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">Hot Data</th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">Warm Data</th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">Cold Data</th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">Deleted Data</th>
              </tr>
            </thead>

            <tbody>
              {archiveRuleRows.map((row, index) => (
                <tr key={index} className={rowClass(row.kind)}>
                  <td className="border-b border-slate-100 px-4 py-3 align-top">{row.stt}</td>
                  <td className="border-b border-slate-100 px-4 py-3 align-top">{row.level1}</td>
                  <td className="border-b border-slate-100 px-4 py-3 align-top">{row.level2}</td>
                  <td className="border-b border-slate-100 px-4 py-3 align-top whitespace-pre-wrap">
                    {row.definition}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 align-top whitespace-pre-wrap">
                    {row.hot}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 align-top whitespace-pre-wrap">
                    {row.warm}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 align-top whitespace-pre-wrap">
                    {row.cold}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 align-top whitespace-pre-wrap">
                    {row.deleted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}