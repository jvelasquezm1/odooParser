import Stack from "ts-data.stack";

import {
  evaluateCondition,
  evaluateLogicalOperation,
  isLogicalOperator,
  splitConditions,
} from "./utils";

export const parseOdooDomain = (
  odooDomain: string,
  account: { [key: string]: any }
) => {
  const odooDomainCleaned = odooDomain.replace(/\s/g, "").split(",");
  let stack = new Stack<boolean>();
  const expressions = odooDomainCleaned
    .map((item, i) => splitConditions(item, odooDomainCleaned, i))
    .filter((item): item is string => !!item);

  for (let i = expressions.length - 1; i >= 0; i--) {
    const currentCondition = expressions[i];
    if (!currentCondition) throw new Error("Condition not found");
    if (isLogicalOperator(currentCondition)) {
      evaluateLogicalOperation(currentCondition, stack);
    } else {
      evaluateCondition(currentCondition, stack, account);
    }
  }
  if (stack.count() !== 1) throw new Error("Incorrect domain format");
  const finalResult = stack.peek();
  return finalResult;
};

// const odooDomain =
//   "['&', '|', '|', ('account_id.user_type_id', 'in', [9, 4]), ('account_id.user_type_id.type', '=', 'Fixed Assets'), ('account_id.code', '=like', '455%'), ('account_id.code', '=like', '456%')";

// const odooDomain =
//   "['&', ('account_id.user_type_id', 'in', [9, 4]), '|', ('account_id.user_type_id.type', '=', 'Fixed Assets'), ('account_id.non_trade', '=', True)]";
const odooDomain1 =
  "['|',('account_id.code', '=like', '454%'), '&', ('account_id.code', '=like', '455%'), '|', ('account_id.code', '=like', '456%'), '|', ('account_id.code', '=like', '457%'), '|', ('account_id.code', '=like', '458%'), ('account_id.code', '=like', '459%')]";
const odooDomain =
  "['&', ('account_id.user_type_id', 'in', [3, 5, 7]), '|', ('account_id.user_type_id', '=', 13), ('account_id.user_type_id.type', '=', 'receivable')]";
const odooDomain3 = "[('account_id.code', '=like', '695%')]";
const odooDomainError =
  "['&',('account_id.code', '=like', '454%'), '&', ('account_id.user_type_id', '=' '13')]";
const odooDomainError1 = "[]";
const odooDomainError2 = "[('account_id.user_type_id', 'in' [3, 5, 7])]";
const odooDomainError3 = "[('account_id', '=like', '454%')]";

const account = { code: "454", user_type_id: [4, "receivable"] };

console.log(parseOdooDomain(odooDomain, account));
// console.log(parseOdooDomain(odooDomain1, account));
// console.log(parseOdooDomain(odooDomain2, account));
// console.log(parseOdooDomain(odooDomain3, account));

// console.log(parseOdooDomain(odooDomainError, account));
// console.log(parseOdooDomain(odooDomainError1, account));
// console.log(parseOdooDomain(odooDomainError2, account));
// console.log(parseOdooDomain(odooDomainError3, account));
