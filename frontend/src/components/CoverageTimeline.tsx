type CoverageTimelineProps = {
  coverage: any;
};

function parseDate(value?: string | null) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(start: Date, end: Date) {
  return Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
}

function buildRange(min?: string | null, max?: string | null) {
  const start = parseDate(min);
  const end = parseDate(max);
  if (!start || !end) return null;
  return { start, end };
}

function TimelineTrack({
  label,
  subtitle,
  colorClass,
  startPct,
  widthPct,
}: {
  label: string;
  subtitle: string;
  colorClass: string;
  startPct: number;
  widthPct: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{subtitle}</span>
      </div>
      <div className="relative h-4 rounded-full bg-slate-100">
        <div
          className={`absolute top-0 h-4 rounded-full ${colorClass}`}
          style={{
            left: `${startPct}%`,
            width: `${Math.max(widthPct, 1.5)}%`,
          }}
        />
      </div>
    </div>
  );
}

export default function CoverageTimeline({ coverage }: CoverageTimelineProps) {
  const oracleMin = coverage?.oracle?.min_date_display;
  const oracleMax = coverage?.oracle?.max_date_display;

  const icebergExists = coverage?.iceberg?.exists !== false;
  const icebergMin = coverage?.iceberg?.min_date_display;
  const icebergMax = coverage?.iceberg?.max_date_display;

  const allowedMin = coverage?.allowed_offload_window?.min_date;
  const allowedMax = coverage?.allowed_offload_window?.max_date;

  const ranges = [
    buildRange(oracleMin, oracleMax),
    buildRange(icebergMin, icebergMax),
    buildRange(allowedMin, allowedMax),
  ].filter(Boolean) as { start: Date; end: Date }[];

  if (ranges.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Coverage Timeline</h2>
        <p className="mt-2 text-sm text-slate-500">Chưa có dữ liệu để hiển thị timeline.</p>
      </div>
    );
  }

  const globalStart = new Date(
    Math.min(...ranges.map((r) => r.start.getTime()))
  );
  const globalEnd = new Date(
    Math.max(...ranges.map((r) => r.end.getTime()))
  );

  const totalDays = Math.max(1, daysBetween(globalStart, globalEnd));

  function calc(min?: string | null, max?: string | null) {
    const start = parseDate(min);
    const end = parseDate(max);

    if (!start || !end) {
      return { startPct: 0, widthPct: 0 };
    }

    const startPct = (daysBetween(globalStart, start) / totalDays) * 100;
    const widthPct = (daysBetween(start, end) / totalDays) * 100;

    return { startPct, widthPct };
  }

  const oracle = calc(oracleMin, oracleMax);
  const iceberg = calc(icebergMin, icebergMax);
  const allowed = calc(allowedMin, allowedMax);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Coverage Timeline</h2>
      <p className="mt-1 text-sm text-slate-500">
        So sánh khoảng ngày dữ liệu giữa các zone và cửa sổ offload hợp lệ.
      </p>

      <div className="mt-5 space-y-4">
        <TimelineTrack
          label="Oracle / Warm"
          subtitle={`${oracleMin ?? "—"} → ${oracleMax ?? "—"}`}
          colorClass="bg-orange-600"
          startPct={oracle.startPct}
          widthPct={oracle.widthPct}
        />

        <TimelineTrack
          label="Iceberg / Cold"
          subtitle={
            icebergExists
              ? `${icebergMin ?? "—"} → ${icebergMax ?? "—"}`
              : "Chưa có bảng ở vùng Cold"
          }
          colorClass={icebergExists ? "bg-sky-600" : "bg-sky-300"}
          startPct={iceberg.startPct}
          widthPct={icebergExists ? iceberg.widthPct : 1.5}
        />

        <TimelineTrack
          label="Allowed Offload Window"
          subtitle={`${allowedMin ?? "—"} → ${allowedMax ?? "—"}`}
          colorClass="bg-emerald-500"
          startPct={allowed.startPct}
          widthPct={allowed.widthPct}
        />
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
        <span>{globalStart.toISOString().slice(0, 10)}</span>
        <span>{globalEnd.toISOString().slice(0, 10)}</span>
      </div>
    </div>
  );
}