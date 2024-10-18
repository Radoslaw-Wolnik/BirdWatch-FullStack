type DateFormatOptions = {
  year: 'numeric';
  month: 'long';
  day: 'numeric';
  hour: '2-digit';
  minute: '2-digit';
};

export function formatDate(date: Date): string {
  const options: DateFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return date.toLocaleString('en-US', options);
}