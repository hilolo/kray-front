import type { Category } from './category.model';

export interface Settings {
  id: string;
  companyId: string;
  defaultCity: string;
  categories: Category[];
  features: string[];
  amenities: string[];
  propertyTypes: string[];
}

