import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { AiChatListRequest } from '../models/ai-chat/ai-chat-list-request.model';
import type { AiChatListResponse } from '../models/ai-chat/ai-chat-list-response.model';
import type { CreateAiChatRequest } from '../models/ai-chat/create-ai-chat-request.model';
import type { AiChat } from '../models/ai-chat/ai-chat.model';

/**
 * Service for AI chat-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class AiChatService {
  private readonly apiService = inject(ApiService);

  /**
   * Create a new AI chat question
   * POST api/AiChat/create
   * @param request AI chat creation data
   * @returns Observable of created AI chat with answer
   */
  create(request: CreateAiChatRequest): Observable<AiChat> {
    return this.apiService.post<AiChat>('AiChat/create', request);
  }

  /**
   * Get paginated list of AI chats with remaining questions count
   * POST api/AiChat/list
   * @param request AI chat list request parameters
   * @returns Observable of paginated AI chat list response with remaining questions
   */
  list(request: AiChatListRequest): Observable<AiChatListResponse> {
    return this.apiService.post<AiChatListResponse>('AiChat/list', request);
  }
}


