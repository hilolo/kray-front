import type { Category } from './category.model';

export interface Settings {
  id: string;
  companyId: string;
  defaultCity: string;
  categories: Category[];
  features: string[];
  amenities: string[];
  propertyTypes: string[];
  emailNotification: EmailNotification;
  image: string;
  signature: string;
}

export interface EmailNotification {
  lease: LeaseEmail;
  maintenance: MaintenanceEmail;
  reservation: ReservationEmail;
}

export interface LeaseEmail {
  overdue: string;
  pending: string;
  paid: string;
}

export interface MaintenanceEmail {
  paid: string;
}

export interface ReservationEmail {
  confirmation: string;
  enter: string;
  left: string;
}

