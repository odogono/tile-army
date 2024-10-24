export const delay = (fn: () => void, ms: number) =>
  new Promise(() => setTimeout(() => fn(), ms));
