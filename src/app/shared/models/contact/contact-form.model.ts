/**
 * Contact form data structure
 */
export interface ContactFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  identifier: string;
  
  // Company Information
  companyName: string;
  ice: string;
  rc: string;
  
  // Contact Details
  phoneNumbers: string[];
  email: string;
  adresse: string;
  
  // Settings
  isCompany: boolean;
}

