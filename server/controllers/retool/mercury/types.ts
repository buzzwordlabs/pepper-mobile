import moment from 'moment';

export interface MercuryTransaction {
  id: string;
  feeId: null | string;
  amount: number;
  createdAt: string;
  postedAt: string;
  estimatedDeliveryDate: string;
  status: string;
  note: null;
  bankDescription: string;
  externalMemo: null;
  counterpartyId: string;
  details: {
    address: string | null;
    electronicRoutingInfo: string | null;
    domesticWireRoutingInfo: string | null;
    internationalWireRoutingInfo: string | null;
  };
  reasonForFailure: string | null;
  failedAt: string | null;
  dashboardLink: string;
  counterpartyName: string;
  counterpartyNickname: null;
  kind: string;
}

export interface MercuryBalanceResponse {
  accountNumber: string;
  availableBalance: number;
  createdAt: string;
  currentBalance: number;
  id: string;
  kind: string;
  name: string;
  routingNumber: string;
  status: 'active' | 'deleted' | 'pending';
  type: 'mercury' | 'external' | 'recipient';
}

export interface MercuryTransactionsResponse {
  total: number;
  transactions: MercuryTransaction[];
}

export interface MercuryParams {
  limit?: number;
  offset?: number;
  status?: 'pending' | 'sent' | 'cancelled' | 'failed';
  start?: string;
  end?: string;
  search?: string;
}

export type Order = 'ASC' | 'DESC';

export interface DateRange {
  start: moment.Moment;
  end: moment.Moment;
}
