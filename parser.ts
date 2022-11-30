const parseOdooDomain = (
  odooDomain: string,
  account: { [key: string]: string }
) => {
  const regExpParenthesis = /\(([^)]+)\)/g;
  const regExpBrackets = /\[([^)]+)\]/g;
  const expressions = odooDomain
    .replace(regExpParenthesis, "condition")
    .replace(/\[|\]/g, "")
    .replace(/\s/g, "")
    .split(",");
  const comparisons =
    odooDomain.replace(/\s/g, "").match(regExpParenthesis) || [];
  let comparisonCounter = 0;
  let result;

  const conditions = expressions.map((condition) => {
    if (condition.startsWith("'|'") || condition.startsWith("'&'")) {
      return condition;
    }
    const expression = comparisons[comparisonCounter].split(",") || [];
    comparisonCounter++;
    const operator = expression[1].replace(/'/g, "");
    const fieldName = expression[0]
      .replace("(", "")
      .replace(/'/g, "")
      .split(".")[1];
    if (operator === "=like") {
      const value = expression[2]
        .replace("%", "")
        .replace(")", "")
        .replace(/'/g, "");
      return account[fieldName].toLowerCase() === value.toLowerCase();
    }
    if (operator === "=") {
      const value = expression[2].replace(")", "").replace(/'/g, "");
      return account[fieldName] === value;
    }
    if (operator === "in") {
      const values = expression?.join(",")?.match(regExpBrackets);
      const valuesCleaned = values
        ? values[0].replace("[", "").replace("]", "").split(",")
        : "";
      return valuesCleaned.includes(account[fieldName].toString());
    }
    return undefined;
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

const account = { code: "454", user_type_id: "3" };
console.log(parseOdooDomain(odooDomain, account));
