export function formatRecurringAmount(amount) {
  return Number(amount).toFixed(2);
}

export function formatRecurringSchedule(schedule) {
  if (schedule === "monthly") return "Monthly";
  if (schedule === "yearly") return "Yearly";
  return schedule;
}

export function formatRecurringDate(date) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}
