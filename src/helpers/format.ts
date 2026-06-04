// Format currency untuk Indonesia
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

export { formatCurrency, formatCurrencyExport };
