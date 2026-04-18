type ClassValue = string | number | boolean | null | undefined | ClassValue[];

function flattenClassValue(value: ClassValue): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(flattenClassValue);
  }

  return typeof value === "string" || typeof value === "number" ? [String(value)] : [];
}

export function cn(...inputs: ClassValue[]) {
  return inputs.flatMap(flattenClassValue).join(" ");
}
