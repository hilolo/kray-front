import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ZardPageComponent } from '../page/page.component';
import { ZardAiChatComponent, ChatMessage, RecentChat } from '@shared/components/ai-chat/ai-chat.component';
import { ZardAlertComponent } from '@shared/components/alert/alert.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [ZardPageComponent, ZardAiChatComponent, ZardAlertComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-chat.component.html',
})
export class AiChatComponent {
  readonly messages = signal<ChatMessage[]>([]);
  readonly recentChats = signal<RecentChat[]>([
    {
      id: '1',
      title: 'Can you fly?',
      preview: 'I was wondering about the physics of flight...',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      title: 'Do you have emotion...',
      preview: 'What is the nature of consciousness?',
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: '3',
      title: 'Explain quantum physics',
      preview: 'Can you explain quantum entanglement in simple terms?',
      timestamp: new Date(Date.now() - 86400000),
    },
  ]);
  readonly isLoading = signal(false);
  readonly remainingQuestions = signal<number>(20);
  readonly maxQuestionsPerDay = 20;

  onMessageSent(message: string): void {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    // Check if user has remaining questions
    if (this.remainingQuestions() <= 0) {
      return;
    }

    // Decrement remaining questions
    this.remainingQuestions.update(count => Math.max(0, count - 1));

    this.messages.update(msgs => [...msgs, userMessage]);
    this.isLoading.set(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `This is a simulated response to: "${message}". In a real implementation, this would connect to an AI API.`,
        timestamp: new Date(),
      };

      this.messages.update(msgs => [...msgs, aiMessage]);
      this.isLoading.set(false);
    }, 1500);
  }

  onChatSelected(chatId: string): void {
    // Load chat messages for the selected chat
    // This would typically fetch messages from a service
  }

  onNewChat(): void {
    this.messages.set([]);
  }
}

