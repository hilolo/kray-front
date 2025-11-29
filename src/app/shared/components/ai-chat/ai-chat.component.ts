import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, output, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import type { ClassValue } from 'clsx';

import { mergeClasses } from '@shared/utils/merge-classes';
import {
  aiChatInputAreaVariants,
  aiChatInputContainerVariants,
  aiChatMainVariants,
  aiChatMessageContentVariants,
  aiChatMessageVariants,
  aiChatMessagesVariants,
  aiChatSidebarContentVariants,
  aiChatSidebarFooterVariants,
  aiChatSidebarHeaderVariants,
  aiChatSidebarVariants,
  aiChatVariants,
  ZardAiChatMessageContentVariants,
  ZardAiChatMessageVariants,
  ZardAiChatVariants,
} from './ai-chat.variants';
import { ZardButtonComponent } from '../button/button.component';
import { ZardIconComponent } from '../icon/icon.component';
import { ZardInputDirective } from '../input/input.directive';
import { ZardAvatarComponent } from '../avatar/avatar.component';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface RecentChat {
  id: string;
  title: string;
  preview: string;
  timestamp?: Date;
}

@Component({
  selector: 'z-ai-chat',
  exportAs: 'zAiChat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ZardButtonComponent,
    ZardIconComponent,
    ZardInputDirective,
    ZardAvatarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './ai-chat.component.html',
  host: {
    '[class]': 'classes()',
  },
})
export class ZardAiChatComponent {
  private readonly translateService = inject(TranslateService);

  readonly zSize = input<ZardAiChatVariants['zSize']>('default');
  readonly zShowSidebar = input(true);
  readonly zMessages = input<ChatMessage[]>([]);
  readonly zRecentChats = input<RecentChat[]>([]);
  readonly zPlaceholder = input('Ask me anything...');
  readonly zUserAvatar = input<string | null>(null);
  readonly zAssistantAvatar = input<string | null>(null);
  readonly zLoading = input(false);
  readonly zDisabled = input(false);
  readonly zRemainingQuestions = input<number>(20);
  readonly zMaxQuestionsPerDay = input<number>(20);

  readonly class = input<ClassValue>('');

  readonly messageSent = output<string>();
  readonly chatSelected = output<string>();
  readonly newChatClicked = output<void>();

  readonly currentMessage = signal('');
  readonly searchQuery = signal('');

  @ViewChild('messagesContainer', { static: false }) messagesContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput', { static: false }) messageInput?: ElementRef<HTMLInputElement>;

  protected readonly classes = computed(() =>
    mergeClasses(aiChatVariants({ zSize: this.zSize() }), this.class()),
  );

  protected readonly sidebarClasses = computed(() => mergeClasses(aiChatSidebarVariants()));
  protected readonly sidebarHeaderClasses = computed(() => mergeClasses(aiChatSidebarHeaderVariants()));
  protected readonly sidebarContentClasses = computed(() => mergeClasses(aiChatSidebarContentVariants()));
  protected readonly sidebarFooterClasses = computed(() => mergeClasses(aiChatSidebarFooterVariants()));
  protected readonly mainClasses = computed(() => mergeClasses(aiChatMainVariants()));
  protected readonly messagesClasses = computed(() => mergeClasses(aiChatMessagesVariants()));
  protected readonly inputAreaClasses = computed(() => mergeClasses(aiChatInputAreaVariants()));
  protected readonly inputContainerClasses = computed(() => mergeClasses(aiChatInputContainerVariants()));

  protected readonly filteredRecentChats = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const chats = this.zRecentChats();
    if (!query) return chats;
    return chats.filter(chat => 
      chat.title.toLowerCase().includes(query) || 
      chat.preview.toLowerCase().includes(query)
    );
  });

  protected readonly messageClasses = (role: 'user' | 'assistant') =>
    computed(() => mergeClasses(aiChatMessageVariants({ zRole: role })));

  protected readonly messageContentClasses = (role: 'user' | 'assistant') =>
    computed(() => mergeClasses(aiChatMessageContentVariants({ zRole: role })));

  sendMessage(): void {
    const message = this.currentMessage().trim();
    if (!message || this.zDisabled() || this.zLoading() || !this.canAskQuestion()) {
      return;
    }

    this.messageSent.emit(message);
    this.currentMessage.set('');
    
    // Focus back on input
    setTimeout(() => {
      this.messageInput?.nativeElement.focus();
    }, 0);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  selectChat(chatId: string): void {
    this.chatSelected.emit(chatId);
  }

  createNewChat(): void {
    this.newChatClicked.emit();
  }

  protected readonly canAskQuestion = computed(() => {
    return this.zRemainingQuestions() > 0 && !this.zDisabled() && !this.zLoading();
  });

  // Computed: Get placeholder text for input
  protected readonly inputPlaceholder = computed(() => {
    if (this.zDisabled()) {
      return this.zPlaceholder();
    }
    if (this.zRemainingQuestions() === 0) {
      return this.translateService.instant('aiChat.input.dailyLimitReached');
    }
    return this.zPlaceholder();
  });

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 0);
  }

  // Auto-scroll when new messages are added
  protected readonly messages = computed(() => {
    const msgs = this.zMessages();
    this.scrollToBottom();
    return msgs;
  });
}

