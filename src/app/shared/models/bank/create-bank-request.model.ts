/**
 * Create bank request model
 */
export interface CreateBankRequest {
  contactId: string;
  bankName?: string;
  rib: string;
  iban?: string;
  swift?: string;
}

