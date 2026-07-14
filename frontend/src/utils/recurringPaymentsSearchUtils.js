export function filterItemsByName(items, query, nameKey = "name") {
  const term = query.trim().toLowerCase();
  if (!term) return items;
  return items.filter((item) =>
    String(item[nameKey] ?? "").toLowerCase().includes(term)
  );
}
