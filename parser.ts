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

const setValueForComparison = (expression: string) =>
  expression.replace("%", "").replace(")", "").replace(/'/g, "");

const setArrayForComparison = (expression: string[]) => {
  const regExpBrackets = /\[([^)]+)\]/g;
  const values = expression.join(",")?.match(regExpBrackets);
  return values ? values[0].replace("[", "").replace("]", "").split(",") : "";
};

export const parseOdooDomain = (
  odooDomain: string,
  account: { [key: string]: string }
) => {
  const regExpParenthesis = /\(([^)]+)\)/g;
  const odooDomainCleaned = odooDomain
    .replace(regExpParenthesis, "condition")
    .replace(/\[|\]/g, "")
    .replace(/\s/g, "")
    .split(",");
  const comparisons =
    odooDomain.replace(/\s/g, "").match(regExpParenthesis) || [];
  let comparisonCounter = 0;
  let result;

  const conditions = odooDomainCleaned.map((condition) => {
    if (["|", "&"].includes(condition.replace(/'/g, ""))) {
      return condition;
    }
    const expression = comparisons[comparisonCounter].split(",") || [];
    comparisonCounter++;
    const operator = expression[1].replace(/'/g, "");
    const fieldName = expression[0]
      .replace("(", "")
      .replace(/'/g, "")
      .split(".")[1];
    switch (operator) {
      case Operators.EqualLike:
        return (
          account[fieldName].toLowerCase() ===
          setValueForComparison(expression[2])
        );
      case Operators.NotLike:
        return (
          account[fieldName].toLowerCase() !==
          setValueForComparison(expression[2])
        );
      case Operators.Equal:
        return (
          account[fieldName].toLowerCase() ===
          setValueForComparison(expression[2])
        );
      case Operators.In:
        return setArrayForComparison(expression)?.includes(
          account[fieldName].toString()
        );
      default:
        return undefined;
    }
  });

  for (let i = conditions.length; i > 0; i--) {
    if (i === conditions.length) {
      result = conditions[i - 1];
    } else {
      if (conditions[i - 2] === "'|'" || conditions[i - 2] === "'&'") {
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
  "['|',('account_id.code', '=like', '454%'), '&', ('account_id.code', '=like', '455%'), '|', ('account_id.code', '=like', '456%'), '|', ('account_id.code', '=like', '457%'), '|', ('account_id.code', '=like', '458%'), ('account_id.code', '=like', '459%')]";
//   "['&', ('account_id.user_type_id', 'in', [3, 5, 7]), '&', ('account_id.user_type_id', 'in', [3]), ('account_id.user_type_id.type', '=', 'receivable')]";
// "[('account_id.code', '=like', '695%')]";

const account = { code: "454", user_type_id: "3" };
console.log(parseOdooDomain(odooDomain, account));
