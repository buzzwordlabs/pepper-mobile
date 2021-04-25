import axios from 'axios';
import moment, { Moment } from 'moment';
import {
  MercuryTransaction,
  MercuryTransactionsResponse,
  MercuryParams,
  MercuryBalanceResponse,
  DateRange
} from './types';
import { groupBy, overEvery, sortBy } from 'lodash';
import { MERCURY_ACCOUNT_ID, MERCURY_API_KEY } from '../../../config';

const roundHundreths = (number: number) => Math.round(number * 1000) / 1000;
const stringFormatDate = (date: Moment) => moment(date).format('YYYY-MM-DD');
const groupTransactionsByMonth = (transactions: MercuryTransaction[]) => {
  return groupBy(transactions, transaction =>
    labelFormatDate(moment(transaction.createdAt))
  );
};
const filterOutTransfers = (t: MercuryTransaction) =>
  !t.counterpartyName.includes('VENMO') && !t.kind.includes('externalTransfer');
const filterOutRevenue = (t: MercuryTransaction) => t.amount < 0;
const filterOutCosts = (t: MercuryTransaction) => t.amount > 0;
const filterOutCounterParty = (t: MercuryTransaction, counterParty: string) =>
  t.counterpartyName.toLowerCase().includes(counterParty.toLowerCase());
const filterByDate = (
  transactions: MercuryTransaction[],
  { start, end }: DateRange
) => transactions.filter(t => moment(t.createdAt).isBetween(start, end));
const sortByDate = (transactions: MercuryTransaction[]) =>
  sortBy(transactions, [t => t.createdAt]);

const labelFormatDate = (date: Moment) => date.format('MM/YY');

const mercuryRequest = async (url: string, params?: MercuryParams) => {
  return await axios.get(url, {
    params,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json'
    },
    auth: {
      username: MERCURY_API_KEY!,
      password: ''
    }
  });
};

const queryMercuryTransactions = async (
  params?: MercuryParams
): Promise<MercuryTransactionsResponse> => {
  const mercuryResponse = await mercuryRequest(
    `
    https://backend.mercury.co/api/v1/account/${MERCURY_ACCOUNT_ID}/transactions
  `,
    params
  );
  return mercuryResponse.data;
};

const queryMercuryBalance = async (): Promise<MercuryBalanceResponse> => {
  const mercuryResponse = await mercuryRequest(
    `https://backend.mercury.co/api/v1/account/${MERCURY_ACCOUNT_ID}`
  );
  return mercuryResponse.data;
};

const extractCostsOrRevenueGrowth = ({
  transactions,
  type
}: {
  transactions: MercuryTransaction[];
  type: 'cost' | 'revenue';
}) => {
  let filterFunctions;
  if (type.toLowerCase() === 'cost')
    filterFunctions = overEvery([filterOutRevenue, filterOutTransfers]);
  else if (type.toLocaleLowerCase() === 'revenue')
    filterFunctions = overEvery([filterOutCosts, filterOutTransfers]);
  else return;

  const filteredTransactions = sortByDate(transactions).filter(
    filterFunctions as any
  );

  const groupedTransactions = groupTransactionsByMonth(filteredTransactions);
  const datesAndAmounts: { [key: string]: number } = {};
  Object.keys(groupedTransactions).forEach(key => {
    let amountThisMonth = 0;
    groupedTransactions[key].forEach(
      transaction =>
        (amountThisMonth +=
          amountThisMonth > 0 ? transaction.amount : -1 * transaction.amount)
    );
    datesAndAmounts[key] = amountThisMonth;
  });

  const oldDates = Object.keys(datesAndAmounts);
  const dates = oldDates.map((date, index) => {
    if (index === oldDates.length - 1) {
      return `${oldDates[index]} - ${labelFormatDate(
        moment(oldDates[index], 'MM/YY').add(1, 'months')
      )}`;
    }
    return `${oldDates[index]} - ${oldDates[index + 1]}`;
  });
  const amounts: number[] = Object.values(datesAndAmounts);
  const growthRates = amounts.map((amount, index) => {
    if (index === 0) return 0;
    const lastMonth = amounts[index - 1];
    const thisMonth = amounts[index];
    return roundHundreths((thisMonth - lastMonth) / lastMonth);
  });
  return { dates, growthRates };
};

const extractMonthlyCostsOrRevenue = ({
  transactions,
  type,
  params
}: {
  transactions: MercuryTransaction[];
  type: 'cost' | 'revenue';
  params: { counterPartyName: string };
}) => {
  let filterFunctions;
  if (type.toLowerCase() === 'cost')
    filterFunctions = overEvery([filterOutRevenue, filterOutTransfers]);
  else if (type.toLocaleLowerCase() === 'revenue')
    filterFunctions = overEvery([filterOutCosts, filterOutTransfers]);
  else return;

  let filteredTransactions = sortByDate(transactions).filter(
    filterFunctions as any
  );
  if (params.counterPartyName)
    filteredTransactions = filteredTransactions.filter(t =>
      filterOutCounterParty(t, params.counterPartyName)
    );

  const groupedTransactions = groupTransactionsByMonth(filteredTransactions);
  const datesAndAmounts: { [date: string]: number } = {};
  Object.keys(groupedTransactions).forEach(key => {
    let amountThisMonth = 0;
    groupedTransactions[key].forEach(
      transaction =>
        (amountThisMonth +=
          transaction.amount > 0 ? transaction.amount : -1 * transaction.amount)
    );
    datesAndAmounts[key] = amountThisMonth;
  });
  return datesAndAmounts;
};

export {
  roundHundreths,
  stringFormatDate,
  groupTransactionsByMonth,
  filterOutTransfers,
  filterOutRevenue,
  filterOutCosts,
  filterOutCounterParty,
  filterByDate,
  sortByDate,
  mercuryRequest,
  queryMercuryTransactions,
  queryMercuryBalance,
  extractCostsOrRevenueGrowth,
  extractMonthlyCostsOrRevenue
};
