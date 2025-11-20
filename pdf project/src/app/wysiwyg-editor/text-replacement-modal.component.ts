import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-replacement-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Replace Text Placeholders</h2>
          <button class="close-btn" (click)="onCancel()">&times;</button>
        </div>
        
        <div class="modal-body">
          <p class="modal-description">
            Found {{ placeholderCount }} placeholder(s). Enter the text to replace each #text# placeholder:
          </p>
          
          <div *ngFor="let placeholder of placeholders; let i = index" class="input-group">
            <label>Placeholder {{ i + 1 }}:</label>
            <input 
              type="text" 
              [(ngModel)]="placeholders[i].value"
              [placeholder]="'Enter text for placeholder ' + (i + 1)"
              class="text-input"
            />
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onCancel()">Cancel</button>
          <button class="btn btn-primary" (click)="onConfirm()">Replace & Convert</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from { 
        transform: translateY(-50px);
        opacity: 0;
      }
      to { 
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      color: #666;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      line-height: 1;
    }

    .close-btn:hover {
      color: #333;
    }

    .modal-body {
      padding: 20px;
    }

    .modal-description {
      color: #666;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .input-group {
      margin-bottom: 20px;
    }

    .input-group label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
      font-size: 14px;
    }

    .text-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.3s ease;
    }

    .text-input:focus {
      outline: none;
      border-color: #2196F3;
    }

    .modal-footer {
      padding: 20px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .btn-primary {
      background: #2196F3;
      color: white;
    }

    .btn-primary:hover {
      background: #1976D2;
    }

    .btn-secondary {
      background: #757575;
      color: white;
    }

    .btn-secondary:hover {
      background: #616161;
    }
  `]
})
export class TextReplacementModalComponent {
  @Input() isVisible: boolean = false;
  @Output() confirm = new EventEmitter<string[]>();
  @Output() cancel = new EventEmitter<void>();

  placeholders: { value: string }[] = [];
  placeholderCount: number = 0;

  setPlaceholders(count: number): void {
    this.placeholderCount = count;
    this.placeholders = Array(count).fill(null).map(() => ({ value: '' }));
  }

  onConfirm(): void {
    const values = this.placeholders.map(p => p.value);
    this.confirm.emit(values);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

