export const setValueForEqualComparison = (expression: string) =>
  expression
    .replace("%", "")
    .replace(/\[|\]/g, "")
    .replace(")", "")
    .replace(/'/g, "")
    .trim();

export const setValueForComparison = (expression: string) =>
  setValueForEqualComparison(expression).replace(/\s/g, "").toLowerCase();

export const setArrayForComparison = (expression: string[]) => {
  const regExpBrackets = /\[([^)]+)\]/g;
  const values = expression.join(",")?.match(regExpBrackets);
  return values ? values[0].replace("[", "").replace("]", "").split(",") : "";
};

export const isLogicalOperator = (condition: string | boolean) =>
  ["|", "&"].includes(`${condition}`.replace(/'/g, "").trim());

export const setStringForComparison = (accountFieldValue: string) =>
  `${accountFieldValue}`.replace(/\s/g, "").toLowerCase();
