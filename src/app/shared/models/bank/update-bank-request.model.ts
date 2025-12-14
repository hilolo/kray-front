/**
 * Update bank request model
 */
export interface UpdateBankRequest {
  id: string;
  contactId: string;
  bankName?: string;
  rib: string;
  iban?: string;
  swift?: string;
}

