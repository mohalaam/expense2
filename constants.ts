import { Category, Partner, PaymentStatus, Currency, Expense } from './types';
import { v4 as uuidv4 } from 'uuid';

export const APP_NAME = "Startup Expense Tracker";

// --- Initial Partners ---
const zakariaPartnerId = uuidv4();
const naoufalPartnerId = uuidv4();
const hamzaPartnerId = uuidv4();
const laamimachPartnerId = uuidv4(); // New partner
const unassignedPartnerId = uuidv4();

export const INITIAL_PARTNERS: Partner[] = [
  { id: zakariaPartnerId, name: "Zakaria", email: "zak@example.com", role: "CEO" },
  { id: naoufalPartnerId, name: "Naoufal", email: "naoufal@example.com", role: "CTO" },
  { id: hamzaPartnerId, name: "Hamza", email: "hamza@example.com", role: "Lead Dev" },
  { id: laamimachPartnerId, name: "Laamimach", email: "laamimach@example.com", role: "Partner" },
  { id: unassignedPartnerId, name: "Unassigned / Company" }
];

// --- Initial Categories ---
const serversHostingCatId = uuidv4();
const softwareSubCatId = uuidv4();
const domainNamesCatId = uuidv4();
const marketingAdsCatId = uuidv4();
const operationalCostsCatId = uuidv4();
const salariesStipendsCatId = uuidv4();
const travelCatId = uuidv4();
const legalProfFeesCatId = uuidv4();
const officeSuppliesCatId = uuidv4();
const miscellaneousCatId = uuidv4();
const rentCatId = uuidv4();
const utilitiesCatId = uuidv4(); // New category for Eau et Electricité
const internetCatId = uuidv4(); // New category for Connexion Fibre

export const INITIAL_CATEGORIES: Category[] = [
  { id: serversHostingCatId, name: "Servers & Hosting", defaultIsFixed: true },
  { id: softwareSubCatId, name: "Software & Subscriptions", defaultIsFixed: true },
  { id: domainNamesCatId, name: "Domain Names", defaultIsFixed: true },
  { id: rentCatId, name: "Rent", defaultIsFixed: true },
  { id: utilitiesCatId, name: "Utilities (Water, Electricity)", defaultIsFixed: true },
  { id: internetCatId, name: "Internet (Fibre, etc.)", defaultIsFixed: true },
  { id: officeSuppliesCatId, name: "Office Supplies" },
  { id: marketingAdsCatId, name: "Marketing & Advertising" },
  { id: operationalCostsCatId, name: "Operational Costs" },
  { id: salariesStipendsCatId, name: "Salaries/Stipends", defaultIsFixed: true },
  { id: travelCatId, name: "Travel" },
  { id: legalProfFeesCatId, name: "Legal & Professional Fees" },
  { id: miscellaneousCatId, name: "Miscellaneous" },
];

export const PAYMENT_METHODS: string[] = [
  "Company Card",
  "Partner Personal",
  "Bank Transfer",
  "Cash",
  "Other"
];

export const PAYMENT_STATUS_OPTIONS = Object.values(PaymentStatus);
export const CURRENCY_OPTIONS = Object.values(Currency); 

export const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const getMonthAndYearFromDate = (dateString: string): { month: string, year: number } => {
  const dateObj = new Date(dateString);
  const adjustedDate = new Date(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate());
  return {
    month: MONTH_NAMES_SHORT[adjustedDate.getMonth()],
    year: adjustedDate.getFullYear(),
  };
};

// --- Initial Expenses ---
export const INITIAL_EXPENSES: Expense[] = [
  // == One-Time Lifetime Paid (Capital Expenditures) - EUR, isFixedCharge: false ==
  {
    date: "2025-04-10", month: "Apr", year: 2025, categoryId: rentCatId,
    provider: "Landlord", description: "Loyer 3 mois (lkra)", amount: 12000, currency: Currency.EUR,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: false, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-11", month: "Apr", year: 2025, categoryId: officeSuppliesCatId,
    provider: "Retail Store", description: "TV Purchase", amount: 7500, currency: Currency.EUR,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: false, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-12", month: "Apr", year: 2025, categoryId: softwareSubCatId,
    provider: "Telaja Services", description: "Telaja Service", amount: 1500, currency: Currency.EUR,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: naoufalPartnerId, isFixedCharge: false, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-13", month: "Apr", year: 2025, categoryId: softwareSubCatId,
    provider: "Rwaq Solutions", description: "Rwaq Service", amount: 1200, currency: Currency.EUR,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: false, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-14", month: "Apr", year: 2025, categoryId: softwareSubCatId, 
    provider: "CNX Provider", description: "CNX Service", amount: 350, currency: Currency.EUR,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: false, entryTimestamp: new Date().toISOString()
  },

  // == Recurring Monthly Fixed Charges - MAD, isFixedCharge: true ==
  // April 2025
  {
    date: "2025-04-01", month: "Apr", year: 2025, categoryId: rentCatId,
    provider: "Landlord", description: "Loyer (Monthly Rent)", amount: 4000, currency: Currency.MAD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: unassignedPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-01", month: "Apr", year: 2025, categoryId: internetCatId,
    provider: "Telecom Provider", description: "Connexion Fibre (Monthly)", amount: 500, currency: Currency.MAD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: unassignedPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-01", month: "Apr", year: 2025, categoryId: utilitiesCatId,
    provider: "Utility Company", description: "Eau et Electricité (Monthly)", amount: 300, currency: Currency.MAD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: unassignedPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  // May 2025
  {
    date: "2025-05-01", month: "May", year: 2025, categoryId: rentCatId,
    provider: "Landlord", description: "Loyer (Monthly Rent)", amount: 4000, currency: Currency.MAD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: unassignedPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-05-01", month: "May", year: 2025, categoryId: internetCatId,
    provider: "Telecom Provider", description: "Connexion Fibre (Monthly)", amount: 500, currency: Currency.MAD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: unassignedPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-05-01", month: "May", year: 2025, categoryId: utilitiesCatId,
    provider: "Utility Company", description: "Eau et Electricité (Monthly)", amount: 300, currency: Currency.MAD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: unassignedPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  
  // == General Expenses (Scripts, Domains, Servers - USD) ==
  // Server Master (USD, recurring as per user grouping with scripts/domains)
  {
    date: "2025-04-05", month: "Apr", year: 2025, categoryId: serversHostingCatId,
    provider: "Server Provider Intl.", description: "Server Master (USD Plan)", amount: 450, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: naoufalPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-05-05", month: "May", year: 2025, categoryId: serversHostingCatId,
    provider: "Server Provider Intl.", description: "Server Master (USD Plan)", amount: 450, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: naoufalPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },

  // Data from Image 3 & 4 (April 2025, USD)
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: serversHostingCatId,
    provider: "logicweb.com", description: "2 servers", itemCount: 2, amount: 200, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: serversHostingCatId,
    provider: "ghostnet.de(avril)", description: "1 server", itemCount: 1, amount: 1111, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: serversHostingCatId,
    provider: "scaleway", description: "1 server (Avril)", itemCount: 1, amount: 1800, currency: Currency.USD, // Clarified "scaleway" vs "scaleway (avril)"
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: serversHostingCatId,
    provider: "hetzner(avril)", description: "Hetzner service (Avril)", amount: 770, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: serversHostingCatId,
    provider: "hetzner", description: "1 server (General)", itemCount: 1, amount: 1500, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: softwareSubCatId,
    provider: "script yahoo", description: "Yahoo Scripts", itemCount: 1, amount: 1000, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: softwareSubCatId,
    provider: "boite yahoo", description: "Boite Yahoo service", amount: 1260, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: softwareSubCatId,
    provider: "boite yahoo", description: "Boite Yahoo Mailbox", itemCount: 0, amount: 1000, currency: Currency.USD, // Assuming '0' item count means not applicable or service based
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: softwareSubCatId,
    provider: "update cortex", description: "Update Cortex service/license", itemCount: 0, amount: 1600, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: naoufalPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: domainNamesCatId,
    provider: "domaines", description: "Domain Purchase(s) April", itemCount: 0, amount: 500, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: naoufalPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString() // Assuming domains are renewed/billed regularly
  },
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: softwareSubCatId,
    provider: "script gsuite", description: "GSuite Scripts/Service", amount: 3000, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: softwareSubCatId,
    provider: "proxyseller", description: "Proxyseller service", amount: 170, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: domainNamesCatId,
    provider: "domains", description: "General Domains April", amount: 300, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: naoufalPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: softwareSubCatId,
    provider: "smtp script", description: "SMTP Script/Service", amount: 1100, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: naoufalPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: miscellaneousCatId, // Could be 'Financial Services' if category exists
    provider: "binance", description: "Binance fees/service", amount: 1170, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: naoufalPartnerId, isFixedCharge: false, entryTimestamp: new Date().toISOString() // Fees are often variable/one-off
  },
   {
    date: "2025-04-15", month: "Apr", year: 2025, categoryId: serversHostingCatId,
    provider: "scaleway (avril)", description: "Scaleway service (Avril label)", amount: 400, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  { // "montant" entry for Hamza - this is a one-off contribution
    date: "2025-04-20", month: "Apr", year: 2025, categoryId: operationalCostsCatId, // Or a "Partner Contribution" category
    provider: "Internal Funding", description: "General Contribution (Hamza)", amount: 13000, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: hamzaPartnerId, isFixedCharge: false, paymentMethod: "Partner Personal", entryTimestamp: new Date().toISOString()
  },

  // Data from Image 3 & 4 (May 2025, USD)
  {
    date: "2025-05-15", month: "May", year: 2025, categoryId: domainNamesCatId,
    provider: "domaines", description: "Domaines (Mai)", amount: 200, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: naoufalPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-05-15", month: "May", year: 2025, categoryId: softwareSubCatId,
    provider: "boites yahoo 200", description: "Boites Yahoo 200", amount: 2250, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: naoufalPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-05-15", month: "May", year: 2025, categoryId: softwareSubCatId,
    provider: "script app password", description: "Script App Password service", amount: 500, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  {
    date: "2025-05-15", month: "May", year: 2025, categoryId: serversHostingCatId,
    provider: "scaleway (mai)", description: "Scaleway service (Mai)", amount: 690, currency: Currency.USD,
    paymentStatus: PaymentStatus.PAID, paidByPartnerId: zakariaPartnerId, isFixedCharge: true, entryTimestamp: new Date().toISOString()
  },
  // Removed redundant "Loyer (Mai - USD existing)" as MAD rent is now primary recurring. If needed, user can re-add.
].map(e => ({...e, id: uuidv4()}));
