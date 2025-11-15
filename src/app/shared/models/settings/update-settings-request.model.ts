import type { Category } from './category.model';

export interface UpdateSettingsRequest {
  defaultCity: string;
  categories: Category[];
  features: string[];
  amenities: string[];
  propertyTypes: string[];
}

