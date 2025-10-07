# 💰 Bond Pricing and Yield Calculator (JavaScript)

A modular **bond pricing engine** implemented in JavaScript to compute **clean price**, **dirty price**, **accrued interest**, and **yield-to-maturity (YTM)** for both **Government** and **Corporate** bonds.

Supports different day count conventions and coupon frequencies such as **monthly**, **semi-annual**, and **annual**.

---


## 🚀 Features

* 🏦 **Government Bonds** using **30E/360** day-count basis
* 🏢 **Corporate Bonds** using **Actual/Actual** basis
* 🗓 Supports multiple **coupon payment frequencies** — Monthly, Quarterly, Semi-Annual, Annual
* 📈 Calculates:

  * Yield to Maturity (YTM)
  * Clean and Dirty Prices
  * Accrued Interest
  * Future Cashflows
* ⚙️ Uses **Newton-Raphson method** for iterative yield solving
* 💡 Modular structure with reusable classes

---

## 📂 Class Overview

### **1. `BondPricer` (Base Class)**

Provides core functionalities:

* `countDays30360(d1, m1, y1, d2, m2, y2)` → 30E/360 day count
* `accruedInterest()` → Calculates accrued interest
* `futureCashflows()` → Generates coupon and redemption cashflows
* `discountFactor(rate, t)` → Computes discount factor
* Shared by both corporate and government bonds

---

### **2. `government` (Subclass of `BondPricer`)**

Implements **30E/360** basis with government-specific logic:

* `_price()` → Calculates bond price given a yield
* `yieldFromPrice()` → Computes yield from price using Newton–Raphson method
* `priceFromYield()` → Returns clean and dirty price
* `numPeriods()` → Determines remaining coupon periods
* Supports **half-yearly (semi-annual)** coupons

---

### **3. `corporate` (Subclass of `BondPricer`)**

Implements **Actual/Actual** day count with corporate bond behavior:

* `priceFromYield(ytm)` → Computes bond price for given yield
* `yieldFromPrice(cleanPrice)` → Computes yield iteratively
* Uses real coupon date schedule and redemption structure

---

## 🧮 Example Usage

```js
 var all_payment = {
        'Annual': "1",
        'ANNUAL': "1",
        'Once a year': "1",
        'Half-yearly': "2",
        'SEMI ANNUAL': "2",
        "Twice a year": '2',
        'Quarterly': "4",
        'QUARTERLY': "4",
        'Four times a year': '4',
        'Monthly': "12",
        "MONTHLY": '12',
        'Twelve times a year': '12',
        'On Maturity': "0"
    }
## 🧮 Government Bond
ISIN='IN0020230085'
let face = 100;
let coupon = 7.18;
let freq = 2;
let redemptions = { "2033-08-14": 100 };

let settlement = new Date();
settlement.setDate(settlement.getDate() + 1);

let last_ip = new Date("2025-08-14");
let next_ip = new Date("2026-02-14");
let maturity_date = new Date("2033-08-14");

let govBond = new government(
  face,
  coupon,
  freq,
  [],
  redemptions,
  settlement,
  "annual",
  last_ip,
  next_ip,
  maturity_date
);

console.log(govBond.yieldFromPrice(100));
```

**Output Example:**

```js
{
  "Days Since": 54,
  "Coupon Days Duration": 180,
  "Accrued Interest": 1.077,
  "Clean Price": 100,
  "Yield": 7.1777,
  "Yield Annual": 7.1777
}
```

```js
## 🧮 Corporate Bond
ISIN='INE07HK07825'

let face = 100;
let coupon = 10.65;
let freq = all_payment['MONTHLY'];
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
 console.log(corporate_bond.priceFromYield(11 / 100));
console.log('yeild: ' + corporate_bond.yieldFromPrice(100)*100);
console.log(BondPricer.prototype.newFutureCashflows.call(corporate_bond, 100000));
```

**Output Example:**

```js
{ "dirty": 100.147609, "clean": 100.2643, "accrued": -0.116712 }
yeild11.185949814866483
{
  '2025-11-12': 904.5205479452055,
  '2025-12-12': 875.3424657534244,
  '2026-01-12': 904.5205479452055,
  '2026-02-12': 904.5205479452055,
  '2026-03-12': 816.986301369863,
  '2026-04-12': 904.5205479452055,
  '2026-05-12': 875.3424657534244,
  '2026-06-12': 904.5205479452055,
  '2026-07-12': 875.3424657534244,
  '2026-08-12': 904.5205479452055,
  '2026-09-12': 904.5205479452055,
  '2026-10-12': 875.3424657534244,
  '2026-11-12': 904.5205479452055,
  '2026-12-12': 875.3424657534244,
  '2027-01-12': 904.5205479452055,
  '2027-02-12': 904.5205479452055,
  '2027-03-12': 816.986301369863,
  '2027-04-12': 904.5205479452055,
  '2027-05-12': 25875.342465753423,
  '2027-06-12': 25904.520547945205,
  '2027-07-12': 25875.342465753423,
  '2027-08-12': 25904.520547945205
}
```

---

## 🧫 Supported Payment Frequencies

| Frequency Label               | Value | Description         |
| ----------------------------- | ----- | ------------------- |
| `Annual` / `ANNUAL`           | 1     | Once a year         |
| `Half-yearly` / `SEMI ANNUAL` | 2     | Twice a year        |
| `Quarterly` / `QUARTERLY`     | 4     | Four times a year   |
| `Monthly` / `MONTHLY`         | 12    | Twelve times a year |
| `On Maturity`                 | 0     | Bullet repayment    |

---

---
📦 bond-pricing-js
├── src/
│ ├── BondPricer.js # Base class
│ ├── government.js # Government bond class
│ ├── corporate.js # Corporate bond class
├── example.js # Example usage
└── README.md # Documentation

---


## ⚙️ Mathematical Concepts

* **Yield to Maturity (YTM)** — Solved iteratively using **Newton-Raphson**
* **Clean Price** = Present Value of future cashflows
* **Dirty Price** = Clean Price + Accrued Interest
* **Accrued Interest** = Coupon × (Days since last payment / Total days in period)

---

## 📘 Project Structure

```
📦 bond-pricing-js
├── BondPricer.js        # Base class with core functions
├── government.js        # Government bond logic (30E/360)
├── corporate.js         # Corporate bond logic (Actual/Actual)
├── index.js             # Example usage
└── README.md            # Documentation
```

---

## 🤩 Dependencies

> No external libraries required — runs on plain JavaScript.

---

## 🧑‍💻 Author

**Sanjay**
📍 India
💼 Web Developer transitioning to AI & Financial Engineering

---

## 🏁 License

This project is licensed under the MIT License — see the LICENSE
file for details.
Feel free to use, modify, and distribute with attribution.
