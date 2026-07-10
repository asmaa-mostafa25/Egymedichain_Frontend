export function toQuery(params) {
  if (!params) return '';

  const filtered = Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  );

  const qs = new URLSearchParams(filtered).toString();
  return qs ? `?${qs}` : '';
}

export function formatDisplayDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB");
}

export function formatDisplayDateTime(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-GB");
}