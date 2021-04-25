import moment from 'moment';
import asyncHandler from 'express-async-handler';
import {
  roundHundreths,
  stringFormatDate,
  filterByDate,
  queryMercuryTransactions,
  queryMercuryBalance,
  extractCostsOrRevenueGrowth,
  extractMonthlyCostsOrRevenue
} from './helpers';

const beginningOfPepper = stringFormatDate(moment('2019-10-01'));

const endOfThisMonth = stringFormatDate(moment().endOf('month'));

/* 
  Returns the monthly revenue or cost between a date range
*/

const monthlyAmounts = asyncHandler(async (req, res, next) => {
  const {
    start = beginningOfPepper,
    end = endOfThisMonth,
    counterPartyName,
    type
  }: {
    start: string;
    end: string;
    counterPartyName: string;
    type: 'cost' | 'revenue';
  } = req.query;

  if (type !== 'cost' && type !== 'revenue') return res.sendStatus(400);
  const { transactions } = await queryMercuryTransactions({ start, end });
  const datesAndAmounts = extractMonthlyCostsOrRevenue({
    transactions,
    type,
    params: { counterPartyName }
  });
  return res.status(200).json({
    dates: Object.keys(datesAndAmounts!),
    amounts: Object.values(datesAndAmounts!)
  });
});

/* 
  Returns current spendable balance in account
*/

const balance = asyncHandler(async (req, res, next) => {
  const { availableBalance, currentBalance } = await queryMercuryBalance();
  return res.status(200).json({ availableBalance, currentBalance });
});

/* 
  Returns the MoM growth rate
  Note: growthRates.length === dates.length - 1
*/

const amountGrowth = asyncHandler(async (req, res, next) => {
  const { type }: { type: 'cost' | 'revenue' } = req.query;
  if (type !== 'cost' && type !== 'revenue') return res.sendStatus(400);
  const { transactions } = await queryMercuryTransactions({
    start: beginningOfPepper,
    end: endOfThisMonth
  });
  const { dates, growthRates } = extractCostsOrRevenueGrowth({
    transactions,
    type
  })!;
  // Remove first null value
  growthRates.shift();
  return res.status(200).json({ dates, growthRates });
});

/* 
  Returns money in and money out in the last 30 days
  unless specified otherwise
*/

const mimo = asyncHandler(async (req, res, next) => {
  const {
    start = stringFormatDate(moment().subtract(30, 'days')),
    end = stringFormatDate(moment())
  } = req.query;

  const { transactions } = await queryMercuryTransactions({ start, end });
  const response = {
    moneyIn: 0,
    moneyOut: 0
  };

  const filteredTransactions = filterByDate(transactions, { start, end });

  filteredTransactions.forEach(({ amount }) =>
    amount > 0
      ? (response.moneyIn += amount)
      : (response.moneyOut += -1 * amount)
  );

  return res.status(200).json({
    moneyIn: roundHundreths(response.moneyIn),
    moneyOut: roundHundreths(response.moneyOut)
  });
});

export { monthlyAmounts, amountGrowth, mimo, balance };
