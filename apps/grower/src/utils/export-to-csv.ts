export interface CSVColumn<T> {
  header: string;
  accessor: (item: T) => string | number | null | undefined;
}

export const exportToCSV = <T>(
  data: T[],
  columns: CSVColumn<T>[],
  filename = "data.csv",
) => {
  if (!data?.length || !columns?.length) return;

  const headers = columns.map((col) => col.header);
  const rows = data.map((item) => columns.map((col) => col.accessor(item)));

  const csv = [headers, ...rows]
    .map((r) =>
      r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
