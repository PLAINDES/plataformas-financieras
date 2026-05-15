// src/shared/utils/inputValidators.ts

export const handleNumberValidation = (
  e: React.ChangeEvent<HTMLInputElement>,
  options: {
    integerOnly?: boolean;
    maxDecimals?: number;
    max?: number;
    min?: number;
  },
  callback: (e: React.ChangeEvent<HTMLInputElement>) => void
) => {
  if (e.target.value !== "") {
    const valString = e.target.value;

    // 1. Bloquear si es solo enteros y escriben un punto/coma
    if (
      options.integerOnly &&
      (valString.includes(".") || valString.includes(","))
    )
      return;

    // 2. Limitar decimales
    if (options.maxDecimals !== undefined && valString.includes(".")) {
      const decimals = valString.split(".")[1];
      if (decimals && decimals.length > options.maxDecimals) return;
    }

    // 3. Limitar valor maximo y minimo
    const numVal = Number(valString);
    if (options.max !== undefined && numVal > options.max) return;
    if (options.min !== undefined && numVal < options.min) return;
  }

  // Si pasa todas las validaciones, ejecuta el onChange original
  callback(e);
};

export const handleNumberKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  integerOnly: boolean = false
) => {
  const blockedKeys = ["e", "E", "+", "-"];
  if (integerOnly) blockedKeys.push(".", ",");

  if (blockedKeys.includes(e.key)) {
    e.preventDefault();
  }
};
