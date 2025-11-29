import type { SearchOptions } from '../api/search-options.model';

/**
 * Request model for listing AI chats
 * Based on GetAiChatsFilter from backend
 */
export interface AiChatListRequest extends SearchOptions {
  currentPage?: number;
  pageSize?: number;
  searchQuery?: string;
}

