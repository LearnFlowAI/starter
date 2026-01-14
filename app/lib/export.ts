export type ExportFormat = "json" | "csv";
export type ExportType = "tasks" | "sessions" | "records" | "scores" | "interruptions" | "rules";

export type ExportOptions = {
  format: ExportFormat;
  includeTypes: ExportType[];
  dateRange?: { start: Date; end: Date };
};

const STORAGE_KEYS: Record<ExportType, string> = {
  tasks: "lf_tasks",
  sessions: "lf_sessions",
  records: "lf_records",
  scores: "lf_scores",
  interruptions: "lf_interruptions",
  rules: "lf_rules"
};

type ExportRow = Record<string, unknown>;

type ExportPayload = Record<string, ExportRow[]>;

const DATE_FIELDS: Partial<Record<ExportType, string>> = {
  sessions: "endedAt",
  records: "createdAt",
  scores: "createdAt",
  interruptions: "createdAt"
};

function safeParse(value: string | null): ExportRow[] {
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function inRange(value: unknown, start: Date, end: Date) {
  if (typeof value !== "string") {
    return false;
  }
  const date = new Date(value);
  return date >= start && date <= end;
}

function buildPayload(options: ExportOptions): ExportPayload {
  if (typeof window === "undefined") {
    return {};
  }

  const payload: ExportPayload = {};
  const { dateRange } = options;

  for (const type of options.includeTypes) {
    const raw = window.localStorage.getItem(STORAGE_KEYS[type]);
    let entries = safeParse(raw);

    const dateField = DATE_FIELDS[type];
    if (dateRange && dateField) {
      entries = entries.filter((entry) =>
        inRange(entry[dateField], dateRange.start, dateRange.end)
      );
    }
    payload[type] = entries;
  }
  return payload;
}

function convertRowsToCSV(rows: ExportRow[]): string {
  if (rows.length === 0) {
    return "";
  }
  const headers = Array.from(
    rows.reduce((set, row) => {
      for (const key of Object.keys(row)) {
        set.add(key);
      }
      return set;
    }, new Set<string>())
  );

  const escapeCell = (value: unknown) => {
    if (value == null) {
      return "";
    }
    const stringValue =
      typeof value === "object" ? JSON.stringify(value) : String(value);
    const escaped = stringValue.replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((key) => escapeCell(row[key])).join(","));
  }
  return lines.join("\n");
}

export function exportData(options: ExportOptions): string {
  const payload = buildPayload(options);

  if (options.format === "json") {
    return JSON.stringify(payload, null, 2);
  }

  const csvBlocks = Object.entries(payload)
    .map(([type, rows]) => {
      const body = convertRowsToCSV(rows);
      return body ? [`# ${type}`, body].join("\n") : "";
    })
    .filter(Boolean);

  return csvBlocks.join("\n\n");
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
