import { Operators } from "./types";

const setValueForEqualComparison = (expression: string) =>
  expression
    .replace(/%/g, "")
    .replace(/\[|\]/g, "")
    .replace(")", "")
    .replace(/'/g, "")
    .trim();

const setValueForComparison = (expression: string) =>
  setValueForEqualComparison(expression).replace(/\s/g, "").toLowerCase();

const setArrayForComparison = (expression: string[]) => {
  const regExpBrackets = /\[([^)]+)\]/g;
  const values = expression.join(",")?.match(regExpBrackets);
  return values ? values[0].replace("[", "").replace("]", "").split(",") : "";
};

const setStringForComparison = (accountFieldValue: string) =>
  `${accountFieldValue}`.replace(/\s/g, "").toLowerCase();

export const isLogicalOperator = (condition: string | boolean) =>
  ["|", "&", "!"].includes(`${condition}`.replace(/'/g, "").trim());

export const getConditionResult = (
  operator: string,
  accountFieldValue: any,
  expression: string[]
) => {
  switch (operator) {
    case Operators.Like:
      return setStringForComparison(accountFieldValue).includes(
        setValueForComparison(expression[2])
      );
    case Operators.NotLike:
      return !setStringForComparison(accountFieldValue).includes(
        setValueForComparison(expression[2])
      );
    case Operators.EqualLike:
      return (
        setStringForComparison(accountFieldValue) ===
        setValueForComparison(expression[2])
      );
    case Operators.In:
      return setArrayForComparison(expression)?.includes(
        `${accountFieldValue}`
      );
    case Operators.NotIn:
      return !setArrayForComparison(expression)?.includes(
        `${accountFieldValue}`
      );
    case Operators.Equal:
      return (
        `${accountFieldValue}` === setValueForEqualComparison(expression[2])
      );
    case Operators.Different:
      return (
        `${accountFieldValue}` !== setValueForEqualComparison(expression[2])
      );
    default:
      return;
  }
};
