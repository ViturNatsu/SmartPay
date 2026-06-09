export const formatDate = (dateString) => {

  if (!dateString) {return }

  const date = new Date(dateString);

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${month}/${year}`;
}