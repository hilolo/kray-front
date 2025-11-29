/**
 * AI Chat model
 * Based on AiChatDto from backend
 */
export interface AiChat {
  id: string;
  question: string;
  answer: string;
  apiChatId?: string;
  companyId: string;
  createdOn: string; // ISO date string
}

