// Portuguese license plate patterns by era
const PLATE_PATTERNS = [
  { era: "1937-1992", regex: /^[A-Z]{2}-\d{2}-\d{2}$/ },
  { era: "1992-2005", regex: /^\d{2}-\d{2}-[A-Z]{2}$/ },
  { era: "2005-2020", regex: /^\d{2}-[A-Z]{2}-\d{2}$/ },
  { era: "2020+", regex: /^[A-Z]{2}-\d{2}-[A-Z]{2}$/ },
];

export function isValidLicensePlate(plate: string): boolean {
  const normalized = plate.toUpperCase().trim();
  return PLATE_PATTERNS.some((p) => p.regex.test(normalized));
}

export function formatLicensePlate(input: string): string {
  const clean = input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (clean.length <= 2) return clean;
  if (clean.length <= 4) return clean.slice(0, 2) + "-" + clean.slice(2);
  return (
    clean.slice(0, 2) + "-" + clean.slice(2, 4) + "-" + clean.slice(4, 6)
  );
}

// Portuguese NIF (Número de Identificação Fiscal) validation
// Uses check-digit algorithm (mod 11)
export function isValidNIF(nif: string): boolean {
  if (!/^\d{9}$/.test(nif)) return false;

  // Valid first digits: 1, 2, 3, 5, 6, 7, 8, 9
  const firstDigit = parseInt(nif[0]);
  if (firstDigit === 0 || firstDigit === 4) return false;

  const checkDigit =
    [9, 8, 7, 6, 5, 4, 3, 2].reduce((sum, weight, i) => {
      return sum + parseInt(nif[i]) * weight;
    }, 0) % 11;

  const control = checkDigit < 2 ? 0 : 11 - checkDigit;
  return control === parseInt(nif[8]);
}

// Month names in PT-PT
export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] || "";
}
