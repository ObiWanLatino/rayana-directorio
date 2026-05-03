/** Display format: #01, #47, #100 */
export function formatCodigo(codigo: number): string {
  return `#${String(codigo).padStart(2, "0")}`;
}
