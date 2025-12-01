import type { Category } from './category.model';
import type { EmailNotification } from './settings.model';

export interface UpdateSettingsRequest {
  defaultCity: string;
  categories: Category[];
  features: string[];
  amenities: string[];
  propertyTypes: string[];
  emailNotification: EmailNotification;
}

