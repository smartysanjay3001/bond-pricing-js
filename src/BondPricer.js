class BondPricer {
  faceValue;
  couponRate;
  frequency;
  ipDates;
  redemptions;
  settlement;

 
  compounding; // "annual", "periodic", "continuous"
  last_ipDate;
  next_ip;

  constructor(
    faceValue,
    couponRate,
    frequency,
    ipDates = [],
    redemptions,
    settlement,
    compounding = "annual",
    last_ipDate,
    next_ip
  ) {
    this.faceValue = faceValue;
    this.couponRate = parseFloat(couponRate) / 100.0;
    this.frequency = frequency;
    this.ipDates = ipDates;
    this.redemptions = redemptions;
    this.settlement = settlement;
    this.last_ipDate = last_ipDate;
    this.next_ip = next_ip;
    this.compounding = compounding.toLowerCase();
  }

  min30(v) {
    return Math.min(30, v);
  }
  countDays30360(d1, m1, y1, d2, m2, y2) {
    return (y2 - y1) * 360 + (m2 - m1) * 30 + this.min30(d2) - this.min30(d1);
  }
  yearFrac(d1, d2) {
    t1 = new Date(d1);
    t2 = new Date(d2);

    const diff_days = this.days_diff(t1, t2);
    const year = this.getFullYear();

    const daysInYear =
      (year % 4 == 0 && year % 100 != 0) || year % 400 == 0 ? 366 : 365.25;
    return diff_days / daysInYear;
  }
  discountFactor(rate, t) {
    if (this.compounding === "continuous") {
      return Math.exp(-rate * t);
    }

    f = Math.max(1, this.frequency);
    return Math.pow(1.0 + rate / f, -t * f);
  }
  isLeapYearInt(year) {
    return year % 400 == 0 || (year % 4 == 0 && year % 100 != 0);
  }
  days_diff(start_date, end_date) {
    const d1 = new Date(start_date);
    const d2 = new Date(end_date);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return (d2 - d1) / (1000 * 60 * 60 * 24);
  }
  futureCashflows() {
    const cf = {};
    let outstanding = this.faceValue;
    let next_ip_str = this.next_ip;

    var next_ip = next_ip_str;
    var next_ip_dt = this.next_ip;
    var last_ip = this.last_ipDate;
    var interst = 0;

    this.ipDates.forEach((element) => {
      const d_dt = new Date(element);
      next_ip = new Date(element);
      const days = this.isLeapYearInt(d_dt.getFullYear()) ? 366 : 365;
      if (d_dt < next_ip_dt) return;
      let totalCashflow =
        (this.days_diff(last_ip, next_ip) / days) *
        this.couponRate *
        outstanding;
      const red = element in this.redemptions ? this.redemptions[element] : 0;
      if (red != 0) {
        interst = outstanding * (red / 100);
      }
      cf[element] = totalCashflow + interst;
      interst = 0;
      last_ip = next_ip;
    });
    return cf;
  }
  newFutureCashflows(new_facevalue) {
    let outstanding = this.faceValue;
    this.faceValue = new_facevalue;
    let cf = this.futureCashflows();
    this.faceValue = outstanding;
    return cf;
  }
  round(value, decimals) {
    return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
  }
  accruedInterest() {
    const last = new Date(this.last_ipDate);
    const next = new Date(this.next_ip);

    if (!last || !next) return 0.0;

    let d1 = last;
    let d2 = next;

    let daysInPeriod = 365 / this.frequency;

    let settlement = this.settlement;

    let daysAccrued = this.days_diff(d1, settlement);

    let fraction = this.round(daysAccrued / daysInPeriod, 6);

    return this.faceValue * (this.couponRate / this.frequency) * fraction;
  }
  futureCashflowsSmest() {
    const cf = {};
    var outstanding = this.faceValue;
    var settlement = this.settlement;
    var prev_ip = this.last_ipDate;

    let days_in_period = this.days_diff(prev_ip, settlement);

    this.ipDates.forEach((value, index, array) => {
      let curr_ip = new Date(value);

      let year = curr_ip.getFullYear();
      let next_ip = new Date(value);
      let days = this.isLeapYearInt(year) ? 366 : 365;

      if (curr_ip <= settlement) return;

      let days_in_period = this.days_diff(prev_ip, curr_ip);
      let days_accrued = parseFloat(this.days_diff(prev_ip, settlement));

      const coupon_per_period =
        (outstanding * this.couponRate) / this.frequency;
      const adjusted_coupon =
        outstanding * (days_in_period / days) * this.couponRate;

      const interest = adjusted_coupon;

      const red = this.redemptions[value] || 0;

      cf[value] = interest + red;

      outstanding -= red;

      prev_ip = curr_ip;
    });

    return cf;
  }
}

export default BondPricer;




// console.log(BondPricer.prototype.newFutureCashflows.call(bp, 100000));
