type CoverageCardProps = {
  schema: string;
  table: string;
  coverage: any;
  loading: boolean;
};

export default function CoverageCard({
  schema,
  table,
  coverage,
  loading,
}: CoverageCardProps) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Coverage</h2>
      <p className="mt-1 text-sm text-slate-500">
        {schema}.{table}
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-slate-600">Đang tải...</p>
      ) : coverage ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-700">Oracle</div>
            <div className="mt-2 text-sm text-slate-900">
              {String(coverage.oracle?.min_date ?? "null")} →{" "}
              {String(coverage.oracle?.max_date ?? "null")}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-700">Iceberg</div>
            <div className="mt-2 text-sm text-slate-900">
              {String(coverage.iceberg?.min_date ?? "null")} →{" "}
              {String(coverage.iceberg?.max_date ?? "null")}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-red-600">Không có dữ liệu coverage</p>
      )}
    </div>
  );
}