import government from "../src/government.js";
import corporate from "../src/corporate.js";
import BondPricer from "../src/BondPricer.js";

var all_payment = {
  "Annual": "1",
  "ANNUAL": "1",
  "Once a year": "1",
  "Half-yearly": "2",
  "SEMI ANNUAL": "2",
  "Twice a year": "2",
  "Quarterly": "4",
  "QUARTERLY": "4",
  "Four times a year": "4",
  "Monthly": "12",
  "MONTHLY": "12",
  "Twelve times a year": "12",
  "On Maturity": "0"
};

/* Corporate Bond  start*/

let face = 100;
let coupon = 10.65;
let freq = all_payment["MONTHLY"];
let redemptions = {
  "2027-05-12": 25,
  "2027-06-12": 25,
  "2027-07-12": 25,
  "2027-08-12": 25
};
// let redemptions = {
//   "2033-08-14": 100
// };
let settlement = new Date();
settlement.setDate(settlement.getDate() + 1);
let compound_based = "annual";
let last_ip = new Date("2025-10-12");
let nearest_date = new Date("2025-11-12");
let ipDates = [
  "2025-10-12",
  "2025-11-12",
  "2025-12-12",
  "2026-01-12",
  "2026-02-12",
  "2026-03-12",
  "2026-04-12",
  "2026-05-12",
  "2026-06-12",
  "2026-07-12",
  "2026-08-12",
  "2026-09-12",
  "2026-10-12",
  "2026-11-12",
  "2026-12-12",
  "2027-01-12",
  "2027-02-12",
  "2027-03-12",
  "2027-04-12",
  "2027-05-12",
  "2027-06-12",
  "2027-07-12",
  "2027-08-12"
];

let corporate_bond = new corporate(
  face,
  coupon,
  freq,
  ipDates,
  redemptions,
  settlement,
  compound_based,
  last_ip,
  nearest_date
);
console.log("Corporate Bond\n")
console.log(corporate_bond.priceFromYield(11 / 100));
console.log("yeild: " + corporate_bond.yieldFromPrice(100) * 100);
console.log(
  BondPricer.prototype.newFutureCashflows.call(corporate_bond, 100000)
);
console.log("Corporate Bond \n")
/* Corporate Bond  end*/

/* Government Bond  start */

face = 100;
coupon = 7.18;
freq = all_payment["Half-yearly"];
// redemptions = {
//   "2027-05-12": 25,
//   "2027-06-12": 25,
//   "2027-07-12": 25,
//   "2027-08-12": 25
// };
redemptions = {
  "2033-08-14": 100
};
settlement = new Date();
settlement.setDate(settlement.getDate() + 1);
compound_based = "annual";
last_ip = new Date("2025-08-14");
nearest_date = new Date("2026-02-14");
let maturity_date = new Date("2033-08-14");

let government_bond = new government(
  face,
  coupon,
  freq,
  [],
  redemptions,
  settlement,
  compound_based,
  last_ip,
  nearest_date,
  maturity_date
);
console.log("Government Bond")
console.log(government_bond.priceFromYield(11 / 100));
console.log(government_bond.yieldFromPrice(100));
console.log("Government Bond \n")

/* Government Bond  end*/
