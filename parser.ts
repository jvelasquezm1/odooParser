import { Operators } from "./types";
import {
  isLogicalOperator,
  setArrayForComparison,
  setValueForComparison,
  setValueForEqualComparison,
} from "./utils";

export const parseOdooDomain = (
  odooDomain: string,
  account: { [key: string]: any }
) => {
  const regExpParenthesis = /\(([^)]+)\)/g;
  const odooDomainCleaned = odooDomain
    .replace(regExpParenthesis, "condition")
    .replace(/\[|\]/g, "")
    .split(",");
  const comparisons = odooDomain.match(regExpParenthesis) || [];
  let comparisonCounter = 0;
  let result;

  const conditions = odooDomainCleaned.map((condition) => {
    if (isLogicalOperator(condition)) {
      return condition;
    }
    if (!comparisons[comparisonCounter]) throw new Error("Condition not found");
    const expression = comparisons[comparisonCounter].split(",") || [];
    console.log(expression[1].replace(/'/g, ""));
    if (expression.length < 3)
      throw new Error(
        `Format of condition must be '(field.fieldName, operator, value)' in ${expression}`
      );
    comparisonCounter++;
    const field = expression[0].replace("(", "").replace(/'/g, "").split(".");
    if (!field[1]) throw new Error(`No field name provided for ${expression}`);
    const operator = expression[1].replace(/'/g, "");
    if (!Object.values(Operators)?.includes(operator as Operators)) {
      throw new Error(`Operator '${operator}' not supported`);
    }
    const fieldName = field[1];

    if (!account[fieldName]) return false;
    let accountFieldName = account[fieldName];
    if (account[fieldName] instanceof Array) {
      accountFieldName = account[fieldName][field[2] ? 1 : 0];
    }
    switch (operator.replace(/\s/g, "")) {
      case Operators.EqualLike:
        return (
          `${accountFieldName}`.replace(/\s/g, "").toLowerCase() ===
          setValueForComparison(expression[2])
        );
      case Operators.NotLike:
        return (
          `${accountFieldName}`.replace(/\s/g, "").toLowerCase() !==
          setValueForComparison(expression[2])
        );
      case Operators.Equal:
        return (
          `${accountFieldName}` === setValueForEqualComparison(expression[2])
        );
      case Operators.In:
        return setArrayForComparison(expression)?.includes(
          `${accountFieldName}`
        );
      default:
        return;
    }
  });
  for (let i = conditions.length; i > 0; i--) {
    if (i === conditions.length) {
      result = conditions[i - 1];
    } else {
      if (isLogicalOperator(conditions[i - 2] || "")) {
        result =
          `${conditions[i - 2]}`.replace(/'/g, "").trim() === "&"
            ? result && conditions[i - 1]
            : result || conditions[i - 1];
        conditions.splice(i - 2, 1);
      }
    }
  }
  return result;
};

const odooDomain =
  // "['|',('account_id.code', '=like', '454%'), '&', ('account_id.code', '=like', '455%'), '|', ('account_id.code', '=like', '456%'), '|', ('account_id.code', '=like', '457%'), '|', ('account_id.code', '=like', '458%'), ('account_id.code', '=like', '459%')]"
  //   "['&', ('account_id.user_type_id', 'in', [3, 5, 7]), '&', ('account_id.user_type_id', 'in', [3]), ('account_id.user_type_id.type', '=', 'receivable')]"
  // "[('account_id.code', '=like', '695%')]"
  "['&', ('account_id.user_type_id', 'in', [9, 4]), '|', ('account_id.user_type_id.type', '=', 'Fixed Assets'), ('account_id.non_trade', '=', True)]";

const account = { code: "454", user_type_id: [9, "Fixed Assets"] };
console.log(parseOdooDomain(odooDomain, account));
