import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export type TransactionInput = {
  accountId: string;
  type:
    | 'DEPOSIT'
    | 'WITHDRAWAL'
    | 'TRANSFER'
    | 'HOLD'
    | 'RELEASE'
    | 'REFUND'
    | 'COMMISSION'
    | 'FEE'
    | 'REWARD';
  amount: number;
  currency?: string;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  referenceType?: string;
  referenceId?: string;
  description?: string;
  metadata?: string | Record<string, unknown> | null;
};

export async function ensureFinancialAccount(
  userId: string,
  type: 'CASH' | 'HOLD' | 'EARNINGS' | 'COMMISSION' | 'REWARDS' | 'ADS_CREDIT',
  currency = 'USD'
) {
  return prisma.financialAccount.upsert({
    where: { userId_type_currency: { userId, type, currency } },
    update: {},
    create: { userId, type, currency, balance: 0 },
  });
}

export async function recordTransaction(input: TransactionInput) {
  const currency = input.currency || 'USD';
  const status = input.status || 'COMPLETED';

  const amount = Math.abs(input.amount);
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  const isDebitToAccount = ['DEPOSIT', 'RELEASE', 'REWARD', 'REFUND'].includes(input.type);
  const isCreditToAccount = ['WITHDRAWAL', 'HOLD', 'COMMISSION', 'FEE'].includes(input.type);

  const [transaction] = await prisma.$transaction([
    prisma.financialTransaction.create({
      data: {
        accountId: input.accountId,
        type: input.type,
        amount,
        currency,
        status,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        description: input.description,
        metadata: typeof input.metadata === 'string' ? input.metadata : input.metadata ? JSON.stringify(input.metadata) : null,
      },
    }),
    prisma.financialAccount.update({
      where: { id: input.accountId },
      data: {
        balance: {
          increment: isDebitToAccount ? amount : isCreditToAccount ? -amount : 0,
        },
      },
    }),
  ]);

  // Create a simple ledger entry for the account side
  await prisma.ledgerEntry.create({
    data: {
      transactionId: transaction.id,
      accountId: input.accountId,
      debit: isDebitToAccount ? amount : 0,
      credit: isCreditToAccount ? amount : 0,
      entryType: ledgerEntryTypeForAccount(input.type),
      costCenter: input.referenceType || undefined,
    },
  });

  // Mirror entry on a platform clearing account (cash/liability)
  await prisma.ledgerEntry.create({
    data: {
      transactionId: transaction.id,
      accountId: 'platform', // virtual account id used for aggregation
      debit: isCreditToAccount ? amount : 0,
      credit: isDebitToAccount ? amount : 0,
      entryType: ledgerEntryTypeForPlatform(input.type),
      costCenter: input.referenceType || undefined,
    },
  });

  return transaction;
}

function ledgerEntryTypeForAccount(type: TransactionInput['type']) {
  switch (type) {
    case 'DEPOSIT':
    case 'RELEASE':
      return 'ASSET';
    case 'WITHDRAWAL':
    case 'HOLD':
      return 'ASSET';
    case 'COMMISSION':
    case 'FEE':
      return 'EXPENSE';
    case 'REWARD':
    case 'REFUND':
      return 'REVENUE';
    default:
      return 'ASSET';
  }
}

function ledgerEntryTypeForPlatform(type: TransactionInput['type']) {
  switch (type) {
    case 'DEPOSIT':
    case 'HOLD':
      return 'LIABILITY';
    case 'RELEASE':
    case 'WITHDRAWAL':
      return 'LIABILITY';
    case 'COMMISSION':
    case 'FEE':
      return 'REVENUE';
    case 'REWARD':
    case 'REFUND':
      return 'EXPENSE';
    default:
      return 'LIABILITY';
  }
}

export async function transferBetweenAccounts(
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  referenceType?: string,
  referenceId?: string
) {
  const currency = 'USD';
  await recordTransaction({
    accountId: fromAccountId,
    type: 'WITHDRAWAL',
    amount,
    currency,
    referenceType,
    referenceId,
    description: `Transfer to ${toAccountId}`,
  });
  await recordTransaction({
    accountId: toAccountId,
    type: 'DEPOSIT',
    amount,
    currency,
    referenceType,
    referenceId,
    description: `Transfer from ${fromAccountId}`,
  });
}

export function generateInvoiceNumber() {
  const now = new Date();
  const ts = now.getTime().toString(36).toUpperCase();
  return `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${ts}`;
}

export type InvoiceLineInput = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export async function createInvoice(
  userId: string,
  payload: {
    type: 'SUBSCRIPTION' | 'AD' | 'MARKETPLACE' | 'BOOKING' | 'SERVICE' | 'FEE';
    businessId?: string;
    currency?: string;
    lineItems: InvoiceLineInput[];
    taxRate?: number;
    discount?: number;
    dueDays?: number;
    metadata?: string | Record<string, unknown> | null;
  }
) {
  const currency = payload.currency || 'USD';
  const subtotal = payload.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = payload.discount || 0;
  const taxable = Math.max(0, subtotal - discount);
  const taxRate = payload.taxRate || 0;
  const taxAmount = +(taxable * (taxRate / 100)).toFixed(2);
  const total = +(taxable + taxAmount).toFixed(2);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (payload.dueDays || 7));

  return prisma.invoice.create({
    data: {
      userId,
      businessId: payload.businessId,
      invoiceNumber: generateInvoiceNumber(),
      type: payload.type,
      subtotal,
      taxAmount,
      discount,
      total,
      currency,
      status: 'ISSUED',
      dueDate,
      metadata: typeof payload.metadata === 'string' ? payload.metadata : payload.metadata ? JSON.stringify(payload.metadata) : null,
      InvoiceLineItems: {
        create: payload.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: +(item.quantity * item.unitPrice).toFixed(2),
        })),
      },
    },
    include: { InvoiceLineItems: true },
  });
}

export async function getTaxForCountry(countryCode?: string, type: 'VAT' | 'SALES' | 'LOCAL' = 'VAT') {
  if (!countryCode) return null;
  return prisma.taxRate.findUnique({
    where: { countryCode_type: { countryCode, type } },
  });
}
