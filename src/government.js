import BondPricer from "./BondPricer.js";
class government extends BondPricer {
  constructor(
    faceValue,
    couponRate,
    frequency,
    ipDates,
    redemptions,
    settlement,
    compounding,
    last_ipDate,
    next_ip,
    maturity_date
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
    this.maturity_date = maturity_date;
  }

  daysfun(frequency) {
    return 360 / frequency;
  }
   generateCouponDates(settlement, maturity, frequency) {
     const result = [];
  const stepMonths = 12 / frequency;
  const end = maturity;
  let curr =  new Date(maturity);
     

  while (curr > settlement) {
    
    result.unshift(new Date(curr));
    curr.setMonth(curr.getMonth() - stepMonths);
  }
  

  return result;
  }
  nextCoupon(settlement, maturity, frequency) {
    const allCoupons = this.generateCouponDates(settlement, maturity, frequency);
    const next = allCoupons.find((d) => d > settlement);
    
 
    return next || maturity;
  }
  previousCoupon(settlement, maturity, frequency) {
    const allCoupons = this.generateCouponDates(settlement, maturity, frequency);
    const prev = [...allCoupons].reverse().find((d) => d <= settlement);
    return prev || settlement;
  }
  numPeriods(settlement, maturity, freq) {
   

    const nextC = this.nextCoupon(settlement, maturity, freq);
     let remaing_year =
      (maturity.getFullYear() - nextC.getFullYear()) * 12 +
      (maturity.getMonth() - nextC.getMonth());
    
    const monthsDiff = remaing_year;
    const value = (monthsDiff * freq) / 12;
    return Math.ceil(value + 1);
    

  }
   
  
  newton(f, fp, x0, tol = 1e-8, maxIter = 50) {
    let x = x0;
    for (let i = 0; i < maxIter; i++) {
      const fx = f(x);
      const fpx = fp(x);
      const next = x - fx / fpx;
      if (Math.abs(next - x) < tol) return next;
      x = next;
    }
    return x;
  }
  dPriceDYld(rate, yield_rate, redemption, freq, DSC, E, N) {
    let dp = 0;
    for (let k = 1; k <= N; k++) {
      dp -=
        (k * (rate / freq) * redemption) /
        Math.pow(1 + yield_rate / freq, k + 1);
    }
    dp -= (N * redemption) / Math.pow(1 + yield_rate / freq, N + 1);
    return dp;
  }
  _price(rate, yield_rate, redemption, freq, DSC, E, N, A) {
    let pv = 0;
    const t = 1 - DSC / E; 
    for (let k = 1; k <= N; k++) {
      
      pv += ((rate / freq) * redemption) / Math.pow(1 + yield_rate / freq, k-t);
    }
    pv += redemption / Math.pow(1 + yield_rate / freq, N-t);
    
    return pv - ((rate / freq) * redemption * A) / E;
  }

  yieldFromPrice(price) {
    const settlement = this.settlement;
    const maturity = this.maturity_date;
    
    const rate = this.couponRate;
    const redemption = 100;
    const frequency = this.frequency;

    if (!price || price === 0 || settlement.getTime() === maturity.getTime()) {
      return {
        "Days Since": 0,
        "Coupon Days Duration": 0,
        "Accrued Interest": 0,
        "Clean Price": 0,
        "Yield": 0,
        "Yield Annual": 0
      };
    }

    const prev = this.last_ipDate;
    const next = this.next_ip;
    

    let d1 = prev.getDate();

    let m1 = prev.getMonth() + 1;

    let y1 = prev.getFullYear();

    let d2 = settlement.getDate();

    let m2 = settlement.getMonth() + 1;

    let y2 = settlement.getFullYear();

    const A = super.countDays30360(d1, m1, y1, d2, m2, y2); // days accrued

    const E = this.daysfun(frequency); // coupon period length

    const DSC = E - A;
   
    const N = this.numPeriods(settlement, maturity, frequency);
   

    const accrued_interest = (rate / frequency) * redemption * (A / E);



  
  let yield_value 
if (N === 1) { 
   
  yield_value = ((redemption / 100 + rate / frequency - price / 100 - ((A / E) * rate) / frequency) / (price / 100 + ((A / E) * rate) / frequency)) * frequency * (E / DSC); 
} 
  else { 
    const f = (yld) => this._price(rate, yld, redemption, frequency, DSC, E, N, A) - price;
     const fp = (yld) => this.dPriceDYld(rate, yld, redemption, frequency, DSC, E, N); 
    
     yield_value = this.newton(f, fp, rate); 
  }

 
  const annualized = (Math.pow(1 + yield_value / frequency, frequency) - 1) * 100;

    

    return {
      "Days Since": A,
      "Coupon Days Duration": E,
      "Accrued Interest": accrued_interest,
      "Clean Price": price,
      "Yield": yield_value * 100,
      "Yield Annual": annualized
    };
  }
  priceFromYield(yield_rate) {
    const settlement = this.settlement;
    const maturity = this.maturity_date;
    const rate = this.couponRate;
    const redemption = 100;
    const frequency = this.frequency;

    const prev = this.last_ipDate;
    const next = this.next_ip;


    let d1 = prev.getDate();

    let m1 = prev.getMonth() + 1;

    let y1 = prev.getFullYear();

    let d2 = settlement.getDate();

    let m2 = settlement.getMonth() + 1;

    let y2 = settlement.getFullYear();

    const A = super.countDays30360(d1, m1, y1, d2, m2, y2); // days accrued
    

    const E = this.daysfun(frequency); // coupon period length
    
    const DSC = E - A;
    
    const N = this.numPeriods(settlement, maturity, frequency);

   

    const accrued_interest = (rate / frequency) * redemption * (A / E);

    // Price calculation using internal formula
    const cleanPrice = this._price(
      rate,
      yield_rate,
      redemption,
      frequency,
      DSC,
      E,
      N,
      A
    );
    const dirtyPrice = cleanPrice + accrued_interest;

    // return dirtyPrice;

    return {
      "Days Since": A,
      "Coupon Days Duration": E,
      "Accrued Interest": accrued_interest,
      "Clean Price": cleanPrice,
      "Dirty Price": dirtyPrice
    };
  }
}

export default government;
