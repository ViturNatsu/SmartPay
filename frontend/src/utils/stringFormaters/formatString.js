export const formatString = (str, interval, separator) => {

  if (!str) return;

  return str.match(new RegExp(`.{1,${interval}}`, 'g')).join(separator);
}