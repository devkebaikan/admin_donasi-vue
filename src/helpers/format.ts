// Format currency
const formatCurrency = (value: string | number) => {
  const num = Number(value);

  if (isNaN(num)) return "-";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};

const formatCurrencyExport = (value: number) => {
  if (value == null) return "0";

  const isNegative = value < 0;
  const absoluteValue = Math.abs(value);

  const formatted = absoluteValue.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
  });

  return isNegative ? `(${formatted})` : formatted;
};

// Format tanggal
const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return "-";

  const date = new Date(value);

  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Format tanggal + waktu
const formatDateTime = (value: string | Date | null | undefined) => {
  if (!value) return "-";

  const date = new Date(value);

  if (isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export { formatCurrency, formatCurrencyExport, formatDate, formatDateTime };
