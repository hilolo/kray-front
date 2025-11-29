import { ChangeDetectionStrategy, Component, signal, inject, OnInit, computed } from '@angular/core';
import { ZardPageComponent } from '../page/page.component';
import { ZardAiChatComponent, ChatMessage, RecentChat } from '@shared/components/ai-chat/ai-chat.component';
import { ZardAlertComponent } from '@shared/components/alert/alert.component';
import { TranslateModule } from '@ngx-translate/core';
import { AiChatService } from '@shared/services/ai-chat.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import type { AiChat } from '@shared/models/ai-chat/ai-chat.model';

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [ZardPageComponent, ZardAiChatComponent, ZardAlertComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-chat.component.html',
})
export class AiChatComponent implements OnInit {
  private readonly aiChatService = inject(AiChatService);
  private readonly alertDialogService = inject(ZardAlertDialogService);

  // Store all conversations
  readonly conversations = signal<Map<string, Conversation>>(new Map());
  readonly activeConversationId = signal<string | null>(null);
  readonly recentChats = signal<RecentChat[]>([]);
  readonly isLoading = signal(false);
  readonly remainingQuestions = signal<number>(20);
  readonly maxQuestionsPerDay = signal<number>(20);

  // Computed: Get active conversation messages
  readonly messages = computed(() => {
    const activeId = this.activeConversationId();
    if (!activeId) return [];
    const conversation = this.conversations().get(activeId);
    return conversation?.messages || [];
  });

  // Computed: Check if active conversation is complete (has an answer)
  readonly isActiveConversationComplete = computed(() => {
    const activeId = this.activeConversationId();
    if (!activeId) return false; // No active conversation means ready for new question
    const conversation = this.conversations().get(activeId);
    if (!conversation) return false;
    // Check if there's at least one assistant message (answer)
    return conversation.messages.some(msg => msg.role === 'assistant');
  });

  ngOnInit(): void {
    this.loadChatHistory();
  }

  loadChatHistory(): Promise<void> {
    this.isLoading.set(true);
    return new Promise((resolve) => {
      this.aiChatService
        .list({
          currentPage: 1,
          pageSize: 100, // Load all chats for now
          searchQuery: '',
        })
        .pipe(
          catchError((error) => {
            console.error('Error loading chat history:', error);
            return of(null);
          }),
          finalize(() => this.isLoading.set(false))
        )
        .subscribe((response) => {
          if (response) {
            this.remainingQuestions.set(response.remainingQuestions);
            this.maxQuestionsPerDay.set(response.maxQuestionsPerDay);

            // Group chats by conversation (each chat ID is a separate conversation)
            const conversationsMap = new Map<string, Conversation>();
            const recentChatsList: RecentChat[] = [];

            response.chats.result.forEach((chat) => {
              // Each chat is its own conversation
              const conversationId = chat.id;
              const messages: ChatMessage[] = [];

              // Add user message
              messages.push({
                id: `${chat.id}-user`,
                role: 'user',
                content: chat.question,
                timestamp: new Date(chat.createdOn),
              });

              // Add assistant message
              if (chat.answer) {
                messages.push({
                  id: `${chat.id}-assistant`,
                  role: 'assistant',
                  content: chat.answer,
                  timestamp: new Date(chat.createdOn),
                });
              }

              // Create conversation
              const conversation: Conversation = {
                id: conversationId,
                title: chat.question.substring(0, 50) + (chat.question.length > 50 ? '...' : ''),
                messages: messages.sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0)),
                createdAt: new Date(chat.createdOn),
              };

              conversationsMap.set(conversationId, conversation);

              // Create recent chat entry
              recentChatsList.push({
                id: chat.id,
                title: chat.question.substring(0, 50) + (chat.question.length > 50 ? '...' : ''),
                preview: chat.answer ? chat.answer.substring(0, 100) + (chat.answer.length > 100 ? '...' : '') : '',
                timestamp: new Date(chat.createdOn),
              });
            });

            // Merge with existing conversations to preserve any new ones
            this.conversations.update((existingConvs) => {
              const merged = new Map(existingConvs);
              // Update or add conversations from server
              conversationsMap.forEach((conv, id) => {
                merged.set(id, conv);
              });
              return merged;
            });
            this.recentChats.set(recentChatsList);

            // Don't automatically set active conversation on initial load
            // User should start with a clean state ready to ask a question
            const currentActiveId = this.activeConversationId();
            if (!currentActiveId || !this.conversations().has(currentActiveId)) {
              // Only set active if there's already an active conversation that exists
              // Otherwise, leave it null to show the "ready to pose question" state
              this.activeConversationId.set(null);
            }
          }
          resolve();
        });
    });
  }

  onMessageSent(message: string): void {
    // Check if active conversation is complete (has an answer)
    if (this.isActiveConversationComplete()) {
      // Don't allow sending messages to completed conversations
      return;
    }

    // Check if user has remaining questions
    if (this.remainingQuestions() <= 0) {
      this.showQuotaReachedModal();
      return;
    }

    // Get or create active conversation
    let activeId = this.activeConversationId();
    const isNewConversation = !activeId || activeId.startsWith('new-');
    
    if (!activeId || isNewConversation) {
      // Create new conversation with temporary ID
      activeId = `new-${Date.now()}`;
      const newConversation: Conversation = {
        id: activeId,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
      };
      this.conversations.update((convs) => {
        const newConvs = new Map(convs);
        newConvs.set(activeId!, newConversation);
        return newConvs;
      });
      this.activeConversationId.set(activeId);
    }

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    // Update conversation with user message
    this.updateConversationMessages(activeId, (msgs) => [...msgs, userMessage]);
    this.isLoading.set(true);

    // Send to backend
    this.aiChatService
      .create({ question: message })
      .pipe(
        catchError((error) => {
          console.error('Error sending message:', error);
          
          // Check if it's a quota error
          if (error?.code === 'daily_limit_reached' || error?.error?.code === 'daily_limit_reached') {
            this.showQuotaReachedModal();
            // Remove the user message since it failed
            this.updateConversationMessages(activeId!, (msgs) => msgs.filter((m) => m.id !== userMessage.id));
              // If it was a new conversation, remove it
            if (isNewConversation) {
              this.conversations.update((convs) => {
                const newConvs = new Map(convs);
                newConvs.delete(activeId!);
                return newConvs;
              });
              // Clear active conversation
              this.activeConversationId.set(null);
            }
          } else {
            // Show error message
            const errorMessage: ChatMessage = {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: error?.message || error?.error?.message || 'Sorry, an error occurred. Please try again later.',
              timestamp: new Date(),
            };
            this.updateConversationMessages(activeId!, (msgs) => {
              const filtered = msgs.filter((m) => m.id !== userMessage.id);
              filtered.push({
                ...userMessage,
                id: `${Date.now()}-user`,
              });
              filtered.push(errorMessage);
              return filtered;
            });
          }
          return of(null);
        }),
        finalize(() => {
          this.isLoading.set(false);
          // Reload chat history to get updated remaining questions and sync conversations
          this.loadChatHistory();
        })
      )
      .subscribe((response) => {
        if (response) {
          const finalConversationId = response.id;
          
          // If this was a new conversation, update the ID
          if (isNewConversation && activeId !== finalConversationId) {
            // Move conversation from temp ID to real ID
            this.conversations.update((convs) => {
              const conv = convs.get(activeId!);
              if (conv) {
                const newConvs = new Map(convs);
                newConvs.delete(activeId!);
                const updatedConv: Conversation = {
                  ...conv,
                  id: finalConversationId,
                  title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
                };
                newConvs.set(finalConversationId, updatedConv);
                return newConvs;
              }
              return convs;
            });
            this.activeConversationId.set(finalConversationId);
            activeId = finalConversationId;
          }

          // Add assistant response
          const aiMessage: ChatMessage = {
            id: `${response.id}-assistant`,
            role: 'assistant',
            content: response.answer || 'No response received.',
            timestamp: new Date(response.createdOn),
          };

          // Update conversation with both messages
          this.updateConversationMessages(activeId!, (msgs) => {
            const filtered = msgs.filter((m) => m.id !== userMessage.id);
            filtered.push({
              ...userMessage,
              id: `${response.id}-user`,
            });
            filtered.push(aiMessage);
            return filtered.sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
          });

          // Update remaining questions
          this.remainingQuestions.update((count) => Math.max(0, count - 1));
        }
      });
  }

  onChatSelected(chatId: string): void {
    // Switch to the selected conversation from the left sidebar list
    if (this.conversations().has(chatId)) {
      this.activeConversationId.set(chatId);
    } else {
      // If conversation doesn't exist, reload history
      this.loadChatHistory().then(() => {
        if (this.conversations().has(chatId)) {
          this.activeConversationId.set(chatId);
        }
      });
    }
  }

  onNewChat(): void {
    // Create a new empty conversation
    const newId = `new-${Date.now()}`;
    const newConversation: Conversation = {
      id: newId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    };
    this.conversations.update((convs) => {
      const newConvs = new Map(convs);
      newConvs.set(newId, newConversation);
      return newConvs;
    });
    this.activeConversationId.set(newId);
  }

  private updateConversationMessages(conversationId: string, updater: (messages: ChatMessage[]) => ChatMessage[]): void {
    this.conversations.update((convs) => {
      const conv = convs.get(conversationId);
      if (conv) {
        const updatedConv = { ...conv, messages: updater(conv.messages) };
        const newConvs = new Map(convs);
        newConvs.set(conversationId, updatedConv);
        return newConvs;
      }
      return convs;
    });
  }

  private showQuotaReachedModal(): void {
    this.alertDialogService.warning({
      zTitle: 'Daily Limit Reached',
      zDescription: `You've reached your daily limit of ${this.maxQuestionsPerDay()} questions. Please try again tomorrow.`,
      zOkText: 'OK',
      zCancelText: null,
    });
  }
}
