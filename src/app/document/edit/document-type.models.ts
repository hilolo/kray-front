/**
 * Document type data field definition
 */
export interface DocumentDataField {
  key: string;
  label: string;
}

/**
 * Common fields available for all document types
 */
export const COMMON_FIELDS: DocumentDataField[] = [
  { key: 'todayDate', label: 'Today Date' },
  { key: 'city', label: 'City' },
];

/**
 * Document type specific fields mapped by document type value
 */
export const DOCUMENT_TYPE_FIELDS: Record<string, DocumentDataField[]> = {
  'lease-agreement': [
    { key: 'tenant', label: 'Tenant' },
    { key: 'tenantAddress', label: 'Tenant Address' },
    { key: 'tenantReference', label: 'Tenant Reference' },
    { key: 'owner', label: 'Owner' },
    { key: 'ownerAddress', label: 'Owner Address' },
    { key: 'ownerReference', label: 'Owner Reference' },
    { key: 'propertyAddress', label: 'Property Address' },
    { key: 'propertyReference', label: 'Property Reference' },
    { key: 'leasePrice', label: 'Lease Price' },
    { key: 'depositPrice', label: 'Deposit Price' },
    { key: 'leaseDuration', label: 'Lease Duration' },
  ],
  'lease': [
    { key: 'tenant', label: 'Tenant' },
    { key: 'tenantAddress', label: 'Tenant Address' },
    { key: 'tenantReference', label: 'Tenant Reference' },
    { key: 'propertyAddress', label: 'Property Address' },
    { key: 'transactionMonth', label: 'Transaction Month' },
    { key: 'transactionPrice', label: 'Transaction Price' },
  ],
  'agreement': [],
  'reservationfull': [],
  'reservationpart': [],
  'fees': [],
  'booking': [],
};

