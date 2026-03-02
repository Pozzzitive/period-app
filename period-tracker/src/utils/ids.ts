let counter = 0;

export function generateId(): string {
  counter++;
  return `${Date.now()}-${counter}-${Math.random().toString(36).substring(2, 9)}`;
}
