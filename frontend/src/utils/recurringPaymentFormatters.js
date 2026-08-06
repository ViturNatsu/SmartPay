export function formatRecurringAmount(amount) {
  return Number(amount).toFixed(2);
}

export function formatRecurringSchedule(schedule) {
  const normalized = String(schedule ?? "").toLowerCase();
  if (normalized === "weekly") return "Weekly";
  if (normalized === "biweekly") return "Bi-weekly";
  if (normalized === "monthly") return "Monthly";
  if (normalized === "yearly") return "Yearly";
  return schedule;
}

export function formatRecurringDate(date) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

export function formatRecurringDateWithYear(date) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}
