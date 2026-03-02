import { format, parseISO, isValid } from 'date-fns';

export function formatDate(dateStr: string, fmt: string = 'MMM d, yyyy'): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, fmt);
}

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function todayString(): string {
  return toDateString(new Date());
}

export function isValidDateString(str: string): boolean {
  const date = parseISO(str);
  return isValid(date);
}
