enum Operators {
  Like = "like",
  NotLike = "not like",
  EqualLike = "=like",
  ILike = "ilike",
  NotILike = "not ilike",
  EqualILike = "=ilike",
  In = "in",
  NotIn = "not in",
  Equal = "=",
  Different = "!=",
  GreaterThan = ">",
  GreaterOrEqualThan = ">=",
  LessThan = "<",
  LessOrEqualThan = "<=",
}

const setValueForEqualComparison = (expression: string) =>
  expression
    .replace("%", "")
    .replace(/\[|\]/g, "")
    .replace(")", "")
    .replace(/'/g, "")
    .trim();

const setValueForComparison = (expression: string) =>
  setValueForEqualComparison(expression).replace(/\s/g, "").toLocaleLowerCase();

const setArrayForComparison = (expression: string[]) => {
  const regExpBrackets = /\[([^)]+)\]/g;
  const values = expression.join(",")?.match(regExpBrackets);
  return values ? values[0].replace("[", "").replace("]", "").split(",") : "";
};

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
    if (["|", "&"].includes(condition.replace(/'/g, "").trim())) {
      return condition;
    }
    if (!comparisons[comparisonCounter]) return;
    const expression = comparisons[comparisonCounter].split(",") || [];
    comparisonCounter++;
    const operator = expression[1].replace(/'/g, "");
    const field = expression[0].replace("(", "").replace(/'/g, "").split(".");
    const fieldName = field[1];
    if (!account[fieldName]) return false;
    let accountFieldName = account[fieldName];
    if (account[fieldName] instanceof Array) {
      accountFieldName = account[fieldName][field[2] ? 1 : 0];
    }
    switch (operator.replace(/\s/g, "")) {
      case Operators.EqualLike:
        return (
          accountFieldName.toString().replace(/\s/g, "").toLowerCase() ===
          setValueForComparison(expression[2])
        );
      case Operators.NotLike:
        return (
          accountFieldName.toString().replace(/\s/g, "").toLowerCase() !==
          setValueForComparison(expression[2])
        );
      case Operators.Equal:
        return (
          accountFieldName.toString() ===
          setValueForEqualComparison(expression[2])
        );
      case Operators.In:
        return setArrayForComparison(expression)?.includes(
          accountFieldName.toString()
        );
      default:
        return;
    }
  });

  for (let i = conditions.length; i > 0; i--) {
    if (i === conditions.length) {
      result = conditions[i - 1];
    } else {
      if (
        `${conditions[i - 2]}`.trim() === "'|'" ||
        `${conditions[i - 2]}`.trim() === "'&'"
      ) {
        result =
          conditions[i - 2] === "'&'"
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
