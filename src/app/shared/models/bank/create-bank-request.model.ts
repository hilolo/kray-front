/**
 * Create bank request model
 */
export interface CreateBankRequest {
  companyId: string;
  contactId: string;
  bankName?: string;
  rib: string;
  iban?: string;
  swift?: string;
}

