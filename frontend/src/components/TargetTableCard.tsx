type TargetTableCardProps = {
  sourceSchema: string;
  sourceTable: string;
  coverage: any;
};

function pickMin(obj: any) {
  return obj?.min_date_display ?? obj?.min_date ?? obj?.min_datadate ?? "null";
}

function pickMax(obj: any) {
  return obj?.max_date_display ?? obj?.max_date ?? obj?.max_datadate ?? "null";
}

export default function TargetTableCard({
  sourceSchema,
  sourceTable,
  coverage,
}: TargetTableCardProps) {
  const targetCatalog = "iceberg";
  const targetSchema = sourceSchema ? sourceSchema.toLowerCase() : "";
  const targetTable = sourceTable ? sourceTable.toLowerCase() : "";

  const iceberg = coverage?.iceberg;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Target Table</h2>
      <p className="mt-1 text-sm text-slate-500">
        Iceberg target derived from the selected Oracle source.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Catalog
          </label>
          <input
            value={targetCatalog}
            readOnly
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Schema
          </label>
          <input
            value={targetSchema}
            readOnly
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Table
          </label>
          <input
            value={targetTable}
            readOnly
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <div className="text-sm font-medium text-slate-700">Iceberg Coverage</div>

        {iceberg?.exists === false ? (
          <div className="mt-2 text-sm text-amber-700">
            {iceberg?.message ??
              "Bảng này chưa có trên vùng Cold. Hệ thống sẽ tự động tạo mới khi offload lần đầu."}
          </div>
        ) : (
          <div className="mt-2 text-sm text-slate-900">
            {pickMin(iceberg)} → {pickMax(iceberg)}
          </div>
        )}
      </div>
    </div>
  );
}