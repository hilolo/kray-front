/**
 * Property category enum matching backend
 */
export enum PropertyCategory {
  Location = 0,      // Rental
  Vente = 1,         // Sale
  LocationVacances = 2  // Holiday Rental
}

/**
 * Payment type enum matching backend
 */
export enum TypePaiment {
  Monthly = 0,
  Daily = 1,
  Weekly = 2,
  Fixed = 3
}

/**
 * Attachment details model from backend
 */
export interface AttachmentDetails {
  id: string;
  url: string;
  fileName: string;
}

/**
 * Property building model from backend
 */
export interface PropertyBuilding {
  id: string;
  name: string;
}

/**
 * Property maintenance summary model from backend
 */
export interface PropertyMaintenanceSummary {
  id: string;
  subject: string;
  status: number; // MaintenanceStatus enum
  priority: number; // MaintenancePriority enum
  scheduledDateTime: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

/**
 * Lease model from backend (simplified for Property context)
 */
export interface Lease {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  propertyImageUrl: string;
  contactId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantAvatarUrl: string;
  tenantIdentifier: string;
  tenancyStart: string;
  tenancyEnd: string;
  tenancyDuration: number | null;
  paymentType: number; // TypePaimentLease enum
  paymentMethod: number; // PaymentMethod enum
  paymentDate: number;
  rentPrice: number;
  depositPrice: number;
  enableReceipts: boolean;
  notificationWhatsapp: boolean;
  notificationEmail: boolean;
  specialTerms: string;
  privateNote: string;
  status: number; // LeasingStatus enum
  isArchived: boolean;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Key model from backend (simplified for Property context)
 */
export interface Key {
  id: string;
  name: string;
  description: string;
  propertyId: string;
  createdOn: string;
  lastModifiedOn?: string;
}

/**
 * Contact model reference (from contact.model.ts)
 */
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  identifier: string;
  email: string;
  phones: string[];
  avatar: string | null;
  // Add other contact properties as needed
}

/**
 * Property model from backend PropertyDto
 */
export interface Property {
  id: string;
  identifier: string;
  name: string;
  description: string;
  address: string;
  city: string;
  typeProperty: string;
  area: number;
  pieces: number;
  bathrooms: number;
  furnished: boolean;
  price: number;
  typePaiment: TypePaiment;
  buildingId: string | null;
  contactId: string;
  companyId: string;
  defaultAttachmentId: string | null;
  defaultAttachmentUrl: string | null;
  features: string[];
  equipment: string[];
  category: PropertyCategory;
  isArchived: boolean;
  isPublic: boolean;
  isPublicAdresse: boolean;
  isReservationShow: boolean;
  ownerName: string | null;
  contact: Contact | null;
  building: PropertyBuilding | null;
  attachments: AttachmentDetails[];
  maintenances: PropertyMaintenanceSummary[];
  leases: Lease[];
  keys: Key[];
  createdAt: string;
  updatedAt: string;
}

