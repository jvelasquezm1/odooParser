import { Operators } from "./types";
import { getConditionResult, isLogicalOperator } from "./utils";

export const parseOdooDomain = (
  odooDomain: string,
  account: { [key: string]: any }
) => {
  const regExpParenthesis = /\(([^)]+)\)/g;
  // Get values on format '(field.fieldName, operator, value)'
  const conditions = odooDomain.match(regExpParenthesis) || [];
  // Create array setting 'condition' string where value on format '(field.fieldName, operator, value)'
  const odooDomainCleaned = odooDomain
    .replace(regExpParenthesis, "condition")
    .replace(/\[|\]/g, "")
    .split(",");

  let conditionCounter = 0;
  let result;

  // Create array with logical operators and boolean result of each condition
  const expressions = odooDomainCleaned.map((condition) => {
    if (isLogicalOperator(condition)) {
      return condition;
    }
    if (!conditions[conditionCounter]) throw new Error("Condition not found");
    const expression = conditions[conditionCounter].split(",") || [];
    if (expression.length < 3)
      throw new Error(
        `Format of condition must be '(field.fieldName, operator, value)' in ${expression}`
      );
    // Increment conditionCounter to replace non logical operator condition in the correct position
    conditionCounter++;

    const field = expression[0].replace("(", "").replace(/'/g, "").split(".");
    if (!field[1]) throw new Error(`No field name provided for ${expression}`);
    const operator = expression[1].replace(/\s/g, "").replace(/'/g, "");
    if (!Object.values(Operators)?.includes(operator as Operators)) {
      throw new Error(`Operator '${operator}' not supported`);
    }
    const fieldName = field[1];

    // If field name not present on account return false in conditions
    if (!account[fieldName] || account[fieldName].length === 0) return false;
    let accountFieldValue = account[fieldName];

    // The accounts from odoo have their foreign keys in arrays
    // Ex: condition on domain => ['&', ('account_id.user_type_id', '=', 13), ('account_id.user_type_id.type', '=', 'Fixed Assets')]
    // user_type_id on account from odoo => [ 8, 'Fixed Assets' ] => ['account_id.user_type_id', 'account_id.user_type_id.type']
    // Other array foreign keys => group_id: [ 111, '285 Autres créances' ], root_id: [ 50056, '28' ], company_id: [ 1, 'Monitr' ]

    if (account[fieldName] instanceof Array) {
      accountFieldValue = account[fieldName][field[2] ? 1 : 0];
    }

    return getConditionResult(operator, accountFieldValue, expression);
  });
  for (let i = expressions.length; i > 0; i--) {
    const currentCondition = expressions[i - 1];
    const previousCondition = expressions[i - 2];
    if (i === expressions.length) {
      // Initialize result with last condition
      result = currentCondition;
    } else {
      if (isLogicalOperator(previousCondition || "")) {
        result =
          `${previousCondition}`.replace(/'/g, "").trim() === "&"
            ? result && currentCondition
            : result || currentCondition;
        // Remove logic operator so is not compared with a boolean
        expressions.splice(i - 2, 1);
      }
    }
  }
  return result;
};

const odooDomain =
  // "['|',('account_id.code', '=like', '454%'), '&', ('account_id.code', '=like', '455%'), '|', ('account_id.code', '=like', '456%'), '|', ('account_id.code', '=like', '457%'), '|', ('account_id.code', '=like', '458%'), ('account_id.code', '=like', '459%')]"
  //   "['&', ('account_id.user_type_id', 'in', [3, 5, 7]), '&', ('account_id.user_type_id', '=', 13), ('account_id.user_type_id.type', '=', 'receivable')]"
  // "[('account_id.code', '=like', '695%')]"
  "['&', ('account_id.user_type_id', 'in', [9, 4]), '|', ('account_id.user_type_id.type', '=', 'Fixed Assets'), ('account_id.non_trade', '=', True)]";

const account = { code: "454", user_type_id: [9, "Fixed Assets"] };
console.log(parseOdooDomain(odooDomain, account));
