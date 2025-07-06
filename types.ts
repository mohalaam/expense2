
export enum PaymentStatus {
  PAID = "Paid",
  DUE = "Due",
  OVERDUE = "Overdue",
  SCHEDULED = "Scheduled",
  PENDING_REIMBURSEMENT = "Pending Reimbursement",
}

export enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  MAD = "MAD", // Added Moroccan Dirham
}

export interface Partner {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface Category {
  id: string;
  name: string;
  defaultIsFixed?: boolean;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  month: string; // "Jan", "Feb", etc.
  year: number;
  categoryId: string;
  provider?: string;
  description: string;
  itemCount?: number;
  amount: number;
  currency: Currency;
  paymentStatus: PaymentStatus;
  paidByPartnerId?: string;
  paymentMethod?: string; // Company Card, Partner Personal, Bank Transfer
  isFixedCharge: boolean; // True for recurring monthly, False for one-time/variable
  notes?: string;
  receiptAttachment?: string; // path/name if stored
  entryTimestamp: string; // ISO 8601 string from Supabase
}

export interface ExpenseFormData extends Omit<Expense, 'id' | 'month' | 'year' | 'entryTimestamp' | 'receiptAttachment'> {
  receiptAttachmentName?: string; // for display purposes if file is selected
}