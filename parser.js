"use strict";
var Operators;
(function (Operators) {
    Operators["Like"] = "like";
    Operators["NotLike"] = "not like";
    Operators["EqualLike"] = "=like";
    Operators["ILike"] = "ilike";
    Operators["NotILike"] = "not ilike";
    Operators["EqualILike"] = "=ilike";
    Operators["In"] = "in";
    Operators["NotIn"] = "not in";
    Operators["Equal"] = "=";
    Operators["Different"] = "!=";
    Operators["GreaterThan"] = ">";
    Operators["GreaterOrEqualThan"] = ">=";
    Operators["LessThan"] = "<";
    Operators["LessOrEqualThan"] = "<=";
})(Operators || (Operators = {}));
const setValueForComparison = (expression) => expression.replace("%", "").replace(")", "").replace(/'/g, "");
const setArrayForComparison = (expression) => {
    var _a;
    const regExpBrackets = /\[([^)]+)\]/g;
    const values = (_a = expression === null || expression === void 0 ? void 0 : expression.join(",")) === null || _a === void 0 ? void 0 : _a.match(regExpBrackets);
    return values ? values[0].replace("[", "").replace("]", "").split(",") : "";
};
const parseOdooDomain = (odooDomain, account) => {
    const regExpParenthesis = /\(([^)]+)\)/g;
    const odooDomainCleaned = odooDomain
        .replace(regExpParenthesis, "condition")
        .replace(/\[|\]/g, "")
        .replace(/\s/g, "")
        .split(",");
    const comparisons = odooDomain.replace(/\s/g, "").match(regExpParenthesis) || [];
    let comparisonCounter = 0;
    let result;
    const conditions = odooDomainCleaned.map((condition) => {
        var _a;
        console.log(condition);
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
                return (account[fieldName].toLowerCase() ===
                    setValueForComparison(expression[2]));
            case Operators.NotLike:
                return (account[fieldName].toLowerCase() !==
                    setValueForComparison(expression[2]));
            case Operators.Equal:
                return (account[fieldName].toLowerCase() ===
                    setValueForComparison(expression[2]));
            case Operators.In:
                return (_a = setArrayForComparison(expression)) === null || _a === void 0 ? void 0 : _a.includes(account[fieldName].toString());
            default:
                return undefined;
        }
    });
    for (let i = conditions.length; i > 0; i--) {
        if (i === conditions.length) {
            result = conditions[i - 1];
        }
        else {
            if (["|", "&"].includes(conditions[i - 2].replace(/'/g, ""))) {
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
const odooDomain = "['|',('account_id.code', '=like', '454%'), '&', ('account_id.code', '=like', '455%'), '|', ('account_id.code', '=like', '456%'), '|', ('account_id.code', '=like', '457%'), '|', ('account_id.code', '=like', '458%'), ('account_id.code', '=like', '459%')]";
//   "['&', ('account_id.user_type_id', 'in', [3, 5, 7]), '&', ('account_id.user_type_id', 'in', [3]), ('account_id.user_type_id.type', '=', 'receivable')]";
// "[('account_id.code', '=like', '695%')]";
const account = { code: "696", user_type_id: "3" };
console.log(parseOdooDomain(odooDomain, account));
