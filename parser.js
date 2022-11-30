const test =
  "['&',('account_id.code', '=like', '454%'), '&', ('account_id.code', '=like', '455%'), '|', ('account_id.code', '=like', '456%'), '|', ('account_id.code', '=like', '457%'), '|', ('account_id.code', '=like', '458%'), ('account_id.code', '=like', '459%')]";
//   "['&', ('account_id.user_type_id', 'in', [3, 5, 7]), '&', ('account_id.user_type_id', 'in', [3]), ('account_id.user_type_id.type', '=', 'receivable')]";
// [ '&', '|', (A), (B), '|', (C), '|', (D), (E) ]

// const expression = test.replace(/\[|\]/g, "").replace(/\s/g, "").split(",");

// const finalCondition = (code === '454'.toLocaleLowerCase() || code === '455'.toLocaleLowerCase())
// const secondCase = (A || B) && (C || D || E)
const regExpParenthesis = /\(([^)]+)\)/g;
const regExpBrackets = /\[([^)]+)\]/g;

const expressions = test
  .replace(regExpParenthesis, "condition")
  .replace(/\[|\]/g, "")
  .replace(/\s/g, "")
  .split(",");

const comparisons = test.replace(/\s/g, "").match(regExpParenthesis) || [];

const conditions = [];

const testAccount = { code: "454", user_type_id: "3" };

let comparisonCounter = 0;

expressions.map((condition, i) => {
  if (condition.startsWith("'|'") || condition.startsWith("'&'")) {
    conditions.push(condition);
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
      conditions.push(
        testAccount[fieldName].toLowerCase() === value.toLowerCase()
      );
    }
    if (operator === "=") {
      const value = expression[2].replace(")", "").replace(/'/g, "");
      conditions.push(testAccount[fieldName] === value);
    }
    if (operator === "in") {
      const values = expression
        .join(",")
        .match(regExpBrackets)[0]
        .replace("[", "")
        .replace("]", "")
        .split(",");
      conditions.push(values.includes(testAccount[fieldName].toString()));
    }
  }
});

let temp;
console.log(conditions);

// Start from the last position expressionsing the operators,
// applying the expressions and removing the operator from the array,
// keeping the value of the condition in temp

for (let i = conditions.length; i > 0; i--) {
  if (i === conditions.length) {
    temp = conditions[i - 1];
  } else {
    if (conditions[i - 2] === "'|'" || conditions[i - 2] === "'&'") {
      console.log(temp, conditions[i - 2], conditions[i - 1]);
      temp =
        conditions[i - 2] === "'&'"
          ? temp && conditions[i - 1]
          : temp || conditions[i - 1];
      conditions.splice(i - 2, 1);
    }
  }
  console.log(temp);
}
