// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throwIfNotNull(v: any, message: string): void {
  if (v !== null) {
    throw new Error(message);
  }
}
