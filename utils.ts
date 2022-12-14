import Stack from "ts-data.stack";
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

const getConditionResult = (
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
      return false;
  }
};

export const evaluateLogicalOperation = (
  currentCondition: string,
  stack: Stack<boolean>
) => {
  const logicalCondition = `${currentCondition}`.replace(/'/g, "").trim();
  if (logicalCondition !== "!") {
    const firstElementToCompare = stack.pop();
    const secondElementToCompare = stack.pop();
    stack.push(
      logicalCondition === "&"
        ? firstElementToCompare && secondElementToCompare
        : firstElementToCompare || secondElementToCompare
    );
  } else {
    stack.push(!stack.pop());
  }
};

export const evaluateCondition = (
  currentCondition: string,
  stack: Stack<boolean>,
  account: { [key: string]: any }
) => {
  const expression = currentCondition.split(",") ?? [];
  if (expression.length < 3)
    throw new Error(
      `Format of condition must be '(field.fieldName, operator, value)' in ${expression}`
    );

  const field = expression[0].replace(/'/g, "").split(".");
  if (!field[1]) throw new Error(`No field name provided for ${expression}`);
  const operator = expression[1].replace(/\s/g, "").replace(/'/g, "");
  if (!Object.values(Operators)?.includes(operator as Operators)) {
    throw new Error(`Operator '${operator}' not supported`);
  }
  const fieldName = field[1];

  // If field name not present on account return false in conditions
  if (!account[fieldName] ?? account[fieldName].length === 0) return false;
  let accountFieldValue = account[fieldName];

  // The accounts from odoo have their foreign keys in arrays
  // Ex: condition on domain => ['&', ('account_id.user_type_id', '=', 13), ('account_id.user_type_id.type', '=', 'Fixed Assets')]
  // user_type_id on account from odoo => [ 8, 'Fixed Assets' ] => ['account_id.user_type_id', 'account_id.user_type_id.type']
  // Other array foreign keys => group_id: [ 111, '285 Autres créances' ], root_id: [ 50056, '28' ], company_id: [ 1, 'Monitr' ]

  if (account[fieldName] instanceof Array) {
    accountFieldValue = account[fieldName][field[2] ? 1 : 0];
  }

  const conditionValue = getConditionResult(
    operator,
    accountFieldValue,
    expression
  );

  stack.push(conditionValue);
};

export const splitConditions = (
  item: string,
  odooDomainCleaned: string[],
  index: number
) => {
  if (
    isLogicalOperator(`${item}`.replace(/\[|\]/g, "").replace(/'/g, "").trim())
  )
    return `${item}`.replace(/\[|\]/g, "").replace(/'/g, "").trim();
  let check = item;
  let counter = index;
  if (item.startsWith("(")) {
    while (
      odooDomainCleaned[counter] &&
      !odooDomainCleaned[counter].endsWith(")")
    ) {
      if (odooDomainCleaned[counter + 1])
        check = `${check},${odooDomainCleaned[counter + 1]}`;
      counter++;
    }
    return check.replace("(", "").replace(")", "");
  }
};
