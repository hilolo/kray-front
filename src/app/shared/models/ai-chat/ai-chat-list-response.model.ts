import type { AiChat } from './ai-chat.model';

/**
 * Response model for listing AI chats
 * Based on AiChatListResponseDto from backend
 */
export interface AiChatListResponse {
  remainingQuestions: number;
  maxQuestionsPerDay: number;
  chats: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    result: AiChat[];
  };
}

