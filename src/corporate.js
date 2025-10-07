import BondPricer from "./BondPricer.js";

class corporate extends BondPricer {
  constructor(
    faceValue,
    couponRate,
    frequency,
    ipDates,
    redemptions,
    settlement,
    compounding,
    last_ipDate,
    next_ip
  ) {
    super(
      faceValue,
      couponRate,
      frequency,
      ipDates,
      redemptions,
      settlement,
      compounding,
      last_ipDate,
      next_ip
    );
  }

  priceFromYield(ytm) {
    const cf = this.futureCashflowsSmest();
    let dirty = 0.0;
    const settlement = this.settlement;

    Object.entries(cf).forEach(([d, c]) => {
      const dt = new Date(d);
      const t = super.days_diff(settlement, dt) / 365.0;
      dirty += c / Math.pow(1 + ytm, t);
    });

    const accrued = super.accruedInterest();
    const clean = dirty - accrued;

    return {
      dirty: parseFloat(dirty.toFixed(6)),
      clean: parseFloat(clean.toFixed(4)),
      accrued: parseFloat(accrued.toFixed(6))
    };
  }

  yieldFromPrice(cleanPrice, guess = 0.01, tol = 1e-10, maxIter = 100) {
    const accrued = super.accruedInterest();

    const dirtyPrice = cleanPrice + accrued;

    let cf_settlement = this.settlement.toISOString().split("T")[0];

    const cf = super.futureCashflowsSmest(); // coupon-based flows
    cf[cf_settlement] = -dirtyPrice;

    let settlement = this.settlement;

    let r = guess;
    for (let i = 0; i < maxIter; i++) {
      let f = 0.0;
      let df = 0.0;

      Object.entries(cf).forEach(([d, c]) => {
        const dt = new Date(d);
        const t = this.days_diff(settlement, dt) / 365.0;
        const disc = Math.pow(1 + r, t);
        f += c / disc;
        df += -(t * c) / (disc * (1 + r));
      });

      const error = f;

      if (Math.abs(error) < tol) return r;
      r -= error / df;
    }

    return r;
  }
}


export default corporate;
