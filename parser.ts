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
  if (odooDomain === "[]") {
    return true;
  }
  const odooDomainCleaned = odooDomain
    .slice(1, -1)
    .replace(/\s/g, "")
    .split(",");
  let stack = new Stack<boolean>();
  const expressions = odooDomainCleaned
    .map((item, i) => splitConditions(item, odooDomainCleaned, i))
    .filter((item): item is string => !!item);

  for (let i = expressions.length - 1; i >= 0; i--) {
    const currentCondition = expressions[i];
    // Condition not found
    if (!currentCondition) {
      console.log(`Condition not found ${currentCondition}`);
      return false;
    }
    if (isLogicalOperator(currentCondition)) {
      evaluateLogicalOperation(currentCondition, stack);
    } else {
      evaluateCondition(currentCondition, stack, account);
    }
  }
  if (stack.count() > 1) {
    for (let i = stack.count(); i === 1; i--) {
      stack.push(stack.pop() && stack.pop());
    }
  }
  const finalResult = stack.peek();
  return finalResult;
};

const odooDomains = [
  "[('account_id.user_type_id', '=', 3)]",
  "['|', ('account_id.user_type_id', 'in', [9, 4]), '&', ('account_id.user_type_id.type', '=', 'payable'), ('account_id.non_trade', '=', True)]",
  "[]",
  "[('account_id.user_type_id.type', '=', 'receivable')]",
  "[('account_id.user_type_id', '=', 13)]",
  "[('account_id.user_type_id', '=', 15)]",
  "[('account_id.code', '=like', '20%')]",
  "[('account_id.code', '=like', '22%')]",
  "[('account_id.code', '=like', '290%')]",
  "['&', ('account_id.user_type_id', 'in', [9, 4]), '|', ('account_id.code', '=like', '31%'), '|', ('account_id.code', '=like', '32%'), '|', ('account_id.code', '=like', '33%'), '|', ('account_id.code', '=like', '34%'), '|', ('account_id.code', '=like', '35%'), ('account_id.code', '=like', '36%')]",
  "[('account_id.code', '=like', '40%')]",
  "['|', ('account_id.code', '=like', '490%'), '|', ('account_id.code', '=like', '491%'), ('account_id.code', '=like', '496%')]",
  "[('account_id.code', '=like', '100%')]",
  "[('account_id.code', '=like', '130%')]",
  "[('account_id.code', '=like', '1310%')]",
  "['|', ('account_id.code', '=like', '160%'), '|', ('account_id.code', '=like', '161%'), '|', ('account_id.code', '=like', '162%'), '|', ('account_id.code', '=like', '163%'), '|', ('account_id.code', '=like', '164%'), ('account_id.code', '=like', '165%')]",
  "['|', ('account_id.code', '=like', '172%'), ('account_id.code', '=like', '173%')]",
  "[('account_id.code', '=like', '171%')]",
  "[('account_id.code', '=like', '42%')]",
  "['|', ('account_id.code', '=like', '430%'), '|', ('account_id.code', '=like', '431%'), '|', ('account_id.code', '=like', '432%'), '|', ('account_id.code', '=like', '433%'), '|', ('account_id.code', '=like', '434%'), '|', ('account_id.code', '=like', '435%'), '|', ('account_id.code', '=like', '436%'), '|', ('account_id.code', '=like', '437%'), ('account_id.code', '=like', '438%')]",
  "['|', ('account_id.code', '=like', '440%'), '|', ('account_id.code', '=like', '442%'), '|', ('account_id.code', '=like', '443%'), ('account_id.code', '=like', '444%')]",
  "['|', ('account_id.code', '=like', '450%'), '|', ('account_id.code', '=like', '451%'), '|', ('account_id.code', '=like', '452%'), ('account_id.code', '=like', '453%')]",
  "[('account_id.code', '=like', '70%')]",
  "['|', ('account_id.code', '=like', '60%'), ('account_id.code', '=like', '61%')]",
  "[('account_id.code', '=like', '750%')]",
  "[('account_id.code', '=like', '650%')]",
  "[('account_id.code', '=like', '760%')]",
  "[('account_id.code', '=like', '660%')]",
  "['|', '|', '|', ('account_id.code', '=like', '670%'), ('account_id.code', '=like', '671%'), ('account_id.code', '=like', '672%'), ('account_id.code', '=like', '673%')]",
  "[('account_id.code', '=like', '691%')]",
  "[('account_id.code', '=like', '694%')]",
  "[('account_id.user_type_id.type', '=', 'receivable'), ('account_id.non_trade', '=', False)]",
  "[('account_id.user_type_id.type', '=', 'payable'), ('account_id.non_trade', '=', False)]",
  "[('account_id.user_type_id', '=', 10)]",
  "[('account_id.user_type_id', '=', 12)]",
  "[('account_id.user_type_id', 'in', [13, 14, 17, 15, 16])]",
  "[('account_id.user_type_id', '=', 11)]",
  "[('account_id.user_type_id', '=', 12)]",
  "[('account_id.user_type_id.type', '=', 'liquidity'), ('credit', '>', 0.0)]",
  "[('account_id.user_type_id.type', '=', 'payable')]",
  "[('account_id.user_type_id', '=', 14)]",
  "[('account_id.user_type_id', '=', 16)]",
  "[('account_id.code', '=like', '21%')]",
  "[('account_id.code', '=like', '23%')]",
  "[('account_id.code', '=like', '291%')]",
  "[('account_id.code', '=like', '37%')]",
  "[('account_id.code', '=like', '41%')]",
  "[('account_id.code', '=like', '499%')]",
  "[('account_id.code', '=like', '101%')]",
  "[('account_id.code', '=like', '11%')]",
  "[('account_id.code', '=like', '1311%')]",
  "[('account_id.code', '=like', '168%')]",
  "['|', ('account_id.code', '=like', '174%'), ('account_id.code', '=like', '170%')]",
  "[('account_id.code', '=like', '175%')]",
  "[('account_id.code', '=like', '439%')]",
  "[('account_id.code', '=like', '441%')]",
  "['|', ('account_id.code', '=like', '454%'), '|', ('account_id.code', '=like', '455%'), '|', ('account_id.code', '=like', '456%'), '|', ('account_id.code', '=like', '457%'), '|', ('account_id.code', '=like', '458%'), ('account_id.code', '=like', '459%')]",
  "[('account_id.code', '=like', '71%')]",
  "[('account_id.code', '=like', '62%')]",
  "[('account_id.code', '=like', '751%')]",
  "[('account_id.code', '=like', '651%')]",
  "[('account_id.code', '=like', '761%')]",
  "[('account_id.code', '=like', '661%')]",
  "[('account_id.code', '=like', '77%')]",
  "[('account_id.code', '=like', '6920%')]",
  "[('account_id.code', '=like', '695%')]",
  "['|', ('account_id.user_type_id', '=', 5), '&', ('account_id.user_type_id.type', '=', 'receivable'), ('account_id.non_trade', '=', True)]",
  "[('account_id.user_type_id', '=', 8)]",
  "[('account_id.user_type_id', '=', 17)]",
  "[('account_id.code', '=like', '24%')]",
  "[('account_id.code', '=like', '12%')]",
  "[('account_id.code', '=like', '132%')]",
  "[('account_id.code', '=like', '176%')]",
  "['|', ('account_id.code', '=like', '492%'), ('account_id.code', '=like', '493%')]",
  "[('account_id.code', '=like', '72%')]",
  "[('account_id.code', '=like', '630%')]",
  "['|', '|', '|', '|', '|', '|', '|', ('account_id.code', '=like', '752%'), ('account_id.code', '=like', '753%'), ('account_id.code', '=like', '754%'), ('account_id.code', '=like', '755%'), ('account_id.code', '=like', '756%'), ('account_id.code', '=like', '757%'), ('account_id.code', '=like', '758%'), ('account_id.code', '=like', '759%')]",
  "['|', '|', '|', '|', '|', '|', '|', ('account_id.code', '=like', '652%'), ('account_id.code', '=like', '653%'), ('account_id.code', '=like', '654%'), ('account_id.code', '=like', '655%'), ('account_id.code', '=like', '656%'), ('account_id.code', '=like', '657%'), ('account_id.code', '=like', '658%'), ('account_id.code', '=like', '659%')]",
  "[('account_id.code', '=like', '762%')]",
  "[('account_id.code', '=like', '662%')]",
  "[('account_id.code', '=like', '6921%')]",
  "[('account_id.code', '=like', '696%')]",
  "[('account_id.user_type_id', '=', 7)]",
  "[('account_id.user_type_id', '=', 6)]",
  "[('account_id.internal_type', '=', 'liquidity')]",
  "[('account_id.code', '=like', '25%')]",
  "[('account_id.code', '=like', '28%')]",
  "['|', ('account_id.code', '=like', '50%'), '|', ('account_id.code', '=like', '51%'), '|', ('account_id.code', '=like', '52%'), ('account_id.code', '=like', '53%')]",
  "[('account_id.code', '=like', '133%')]",
  "['|', ('account_id.code', '=like', '178%'), ('account_id.code', '=like', '179%')]",
  "[('account_id.code', '=like', '46%')]",
  "[('account_id.code', '=like', '73%')]",
  "['|', ('account_id.code', '=like', '631%'), '|', ('account_id.code', '=like', '632%'), '|', ('account_id.code', '=like', '633%'), ('account_id.code', '=like', '634%')]",
  "[('account_id.code', '=like', '763%')]",
  "[('account_id.code', '=like', '663%')]",
  "[('account_id.code', '=like', '26%')]",
  "['|', ('account_id.code', '=like', '54%'), '|', ('account_id.code', '=like', '55%'), '|', ('account_id.code', '=like', '56%'), '|', ('account_id.code', '=like', '57%'), ('account_id.code', '=like', '58%')]",
  "[('account_id.code', '=like', '14%'), ('account_id.user_type_id', '!=', 12)]",
  "[('account_id.code', '=like', '74%')]",
];

const accounts = [
  {
    id: 145,
    message_is_follower: false,
    message_follower_ids: [578],
    message_partner_ids: [],
    message_ids: [580],
    has_message: true,
    message_unread: false,
    message_unread_counter: 0,
    message_needaction: false,
    message_needaction_counter: 0,
    message_has_error: false,
    message_has_error_counter: 0,
    message_attachment_count: 0,
    message_main_attachment_id: false,
    website_message_ids: [],
    message_has_sms_error: false,
    name: "Other financial assets - Current account",
    currency_id: false,
    code: "285000",
    deprecated: false,
    used: false,
    user_type_id: [8, "Fixed Assets"],
    internal_type: "other",
    internal_group: "asset",
    reconcile: false,
    tax_ids: [],
    note: false,
    company_id: [1, "Monitr"],
    tag_ids: [],
    group_id: [111, "285 Autres créances"],
    root_id: [50056, "28"],
    allowed_journal_ids: [],
    opening_debit: 0,
    opening_credit: 0,
    opening_balance: 0,
    is_off_balance: false,
    current_balance: 0,
    related_taxes_amount: 0,
    non_trade: false,
    __last_update: "2022-08-16 15:28:17",
    display_name: "285000 Other financial assets - Current account",
    create_uid: [1, "OdooBot"],
    create_date: "2022-08-16 15:28:17",
    write_uid: [1, "OdooBot"],
    write_date: "2022-08-16 15:28:17",
    exclude_provision_currency_ids: [],
    asset_model: false,
    create_asset: "no",
    can_create_asset: true,
    form_view_ref: "account_asset.view_account_asset_form",
    asset_type: "purchase",
    multiple_assets_per_line: false,
  },
  {
    id: 146,
    message_is_follower: false,
    message_follower_ids: [579],
    message_partner_ids: [],
    message_ids: [581],
    has_message: true,
    message_unread: false,
    message_unread_counter: 0,
    message_needaction: false,
    message_needaction_counter: 0,
    message_has_error: false,
    message_has_error_counter: 0,
    message_attachment_count: 0,
    message_main_attachment_id: false,
    website_message_ids: [],
    message_has_sms_error: false,
    name: "Other financial assets - Bills receivable",
    currency_id: false,
    code: "285100",
    deprecated: false,
    used: false,
    user_type_id: [8, "Fixed Assets"],
    internal_type: "other",
    internal_group: "asset",
    reconcile: false,
    tax_ids: [],
    note: false,
    company_id: [1, "Monitr"],
    tag_ids: [],
    group_id: [111, "285 Autres créances"],
    root_id: [50056, "28"],
    allowed_journal_ids: [],
    opening_debit: 0,
    opening_credit: 0,
    opening_balance: 0,
    is_off_balance: false,
    current_balance: 0,
    related_taxes_amount: 0,
    non_trade: false,
    __last_update: "2022-08-16 15:28:17",
    display_name: "285100 Other financial assets - Bills receivable",
    create_uid: [1, "OdooBot"],
    create_date: "2022-08-16 15:28:17",
    write_uid: [1, "OdooBot"],
    write_date: "2022-08-16 15:28:17",
    exclude_provision_currency_ids: [],
    asset_model: false,
    create_asset: "no",
    can_create_asset: true,
    form_view_ref: "account_asset.view_account_asset_form",
    asset_type: "purchase",
    multiple_assets_per_line: false,
  },
  {
    id: 147,
    message_is_follower: false,
    message_follower_ids: [580],
    message_partner_ids: [],
    message_ids: [582],
    has_message: true,
    message_unread: false,
    message_unread_counter: 0,
    message_needaction: false,
    message_needaction_counter: 0,
    message_has_error: false,
    message_has_error_counter: 0,
    message_attachment_count: 0,
    message_main_attachment_id: false,
    website_message_ids: [],
    message_has_sms_error: false,
    name: "Other financial assets - Fixed income securities",
    currency_id: false,
    code: "285200",
    deprecated: false,
    used: false,
    user_type_id: [8, "Fixed Assets"],
    internal_type: "other",
    internal_group: "asset",
    reconcile: false,
    tax_ids: [],
    note: false,
    company_id: [1, "Monitr"],
    tag_ids: [],
    group_id: [111, "285 Autres créances"],
    root_id: [50056, "28"],
    allowed_journal_ids: [],
    opening_debit: 0,
    opening_credit: 0,
    opening_balance: 0,
    is_off_balance: false,
    current_balance: 0,
    related_taxes_amount: 0,
    non_trade: false,
    __last_update: "2022-08-16 15:28:17",
    display_name: "285200 Other financial assets - Fixed income securities",
    create_uid: [1, "OdooBot"],
    create_date: "2022-08-16 15:28:17",
    write_uid: [1, "OdooBot"],
    write_date: "2022-08-16 15:28:17",
    exclude_provision_currency_ids: [],
    asset_model: false,
    create_asset: "no",
    can_create_asset: true,
    form_view_ref: "account_asset.view_account_asset_form",
    asset_type: "purchase",
    multiple_assets_per_line: false,
  },
  {
    id: 148,
    message_is_follower: false,
    message_follower_ids: [581],
    message_partner_ids: [],
    message_ids: [583],
    has_message: true,
    message_unread: false,
    message_unread_counter: 0,
    message_needaction: false,
    message_needaction_counter: 0,
    message_has_error: false,
    message_has_error_counter: 0,
    message_attachment_count: 0,
    message_main_attachment_id: false,
    website_message_ids: [],
    message_has_sms_error: false,
    name: "Other financial assets - Doubtful amounts",
    currency_id: false,
    code: "285700",
    deprecated: false,
    used: false,
    user_type_id: [8, "Fixed Assets"],
    internal_type: "other",
    internal_group: "asset",
    reconcile: false,
    tax_ids: [],
    note: false,
    company_id: [1, "Monitr"],
    tag_ids: [],
    group_id: [111, "285 Autres créances"],
    root_id: [50056, "28"],
    allowed_journal_ids: [],
    opening_debit: 0,
    opening_credit: 0,
    opening_balance: 0,
    is_off_balance: false,
    current_balance: 0,
    related_taxes_amount: 0,
    non_trade: false,
    __last_update: "2022-08-16 15:28:17",
    display_name: "285700 Other financial assets - Doubtful amounts",
    create_uid: [1, "OdooBot"],
    create_date: "2022-08-16 15:28:17",
    write_uid: [1, "OdooBot"],
    write_date: "2022-08-16 15:28:17",
    exclude_provision_currency_ids: [],
    asset_model: false,
    create_asset: "no",
    can_create_asset: true,
    form_view_ref: "account_asset.view_account_asset_form",
    asset_type: "purchase",
    multiple_assets_per_line: false,
  },
  {
    id: 150,
    user_type_id: [9, "payable"],
    non_trade: true,
    code: "31",
  },
];

const result = odooDomains.map((odooDomain) =>
  accounts.filter((account) => parseOdooDomain(odooDomain, account))
);
console.log(result.filter((r) => r.length > 0));

//Filter to be applied to the accounts
// accounts.filter(
//   account => account.user_type_id[0] === 13 && account.used === true && reportingLines[0].create_uid[0] === account.create_uid[0],
// )

// console.log(
//   parseOdooDomain("[('account_id.credit', '>', 0.0)]", {
//     id: 150,
//     user_type_id: [9, "payable"],
//     non_trade: true,
//     code: "31",
//     credit: 10,
//   })
// );
