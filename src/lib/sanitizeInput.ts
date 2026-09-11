/**
 * Strips anything that isn't a digit, minus sign, comma (decimal) or slash (fraction)
 * from a single numeric-answer field. Used on every free-text input that expects a
 * math answer, so stray letters/symbols never reach validation, storage or display.
 */
export function sanitizeNumericAnswer(value: string): string {
  return value.replace(/[^0-9,/-]/g, '')
}

/**
 * Same idea for comma-separated number lists (e.g. "7, 8, 9" for specific tables or
 * fraction denominators): keeps digits, minus, commas and spaces, strips letters/symbols.
 */
export function sanitizeNumberList(value: string): string {
  return value.replace(/[^0-9,\s-]/g, '')
}
