const test =
  "['&',('account_id.code', '=like', '454%'), '&', ('account_id.code', '=like', '455%'), '|', ('account_id.code', '=like', '456%'), '|', ('account_id.code', '=like', '457%'), '|', ('account_id.code', '=like', '458%'), ('account_id.code', '=like', '459%')]";
//   "['&', ('account_id.user_type_id', 'in', [3, 5, 7]), '&', ('account_id.user_type_id', 'in', [3]), ('account_id.user_type_id.type', '=', 'receivable')]";

const testAccount = { code: "454", user_type_id: "3" };

const regExpParenthesis = /\(([^)]+)\)/g;
const regExpBrackets = /\[([^)]+)\]/g;
const expressions = test
  .replace(regExpParenthesis, "condition")
  .replace(/\[|\]/g, "")
  .replace(/\s/g, "")
  .split(",");
const comparisons = test.replace(/\s/g, "").match(regExpParenthesis) || [];
let comparisonCounter = 0;
let temp;

const conditions = expressions.map((condition) => {
  if (condition.startsWith("'|'") || condition.startsWith("'&'")) {
    return condition;
  } else {
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
      return testAccount[fieldName].toLowerCase() === value.toLowerCase();
    }
    if (operator === "=") {
      const value = expression[2].replace(")", "").replace(/'/g, "");
      return testAccount[fieldName] === value;
    }
    if (operator === "in") {
      const values = expression?.join(",")?.match(regExpBrackets);
      const valuesCleaned = values
        ? values[0].replace("[", "").replace("]", "").split(",")
        : "";
      return valuesCleaned.includes(testAccount[fieldName].toString());
    }
  }
});

for (let i = conditions.length; i > 0; i--) {
  if (i === conditions.length) {
    temp = conditions[i - 1];
  } else {
    if (conditions[i - 2] === "'|'" || conditions[i - 2] === "'&'") {
      temp =
        conditions[i - 2] === "'&'"
          ? temp && conditions[i - 1]
          : temp || conditions[i - 1];
      conditions.splice(i - 2, 1);
    }
  }
}
