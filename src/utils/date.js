const asDate = (value) => (value instanceof Date ? value : new Date(value));

export const startOfDay = (value = new Date()) => {
  const date = new Date(asDate(value));
  date.setHours(0, 0, 0, 0);
  return date;
};

export const endOfDay = (value = new Date()) => {
  const date = new Date(asDate(value));
  date.setHours(23, 59, 59, 999);
  return date;
};

export const daysAgo = (days, value = new Date()) => {
  const date = new Date(asDate(value));
  date.setDate(date.getDate() - days);
  return date;
};

export const dateRangeForDays = (days = 30, value = new Date()) => ({
  from: startOfDay(daysAgo(Math.max(1, days) - 1, value)).toISOString(),
  to: endOfDay(value).toISOString(),
});

export const toDateInputValue = (value) => {
  if (!value) return '';
  const date = asDate(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

export const formatDate = (value, options) => {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(asDate(value));
};

export const formatDateTime = (value, options) => {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...options,
  }).format(asDate(value));
};

export const formatDuration = (minutes = 0) => {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const remainder = total % 60;
  if (!hours) return `${remainder} min`;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
};
