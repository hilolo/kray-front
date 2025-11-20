import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { CommonModule } from '@angular/common';
import { ZardTextEditorComponent } from '@shared/components/text-editor/text-editor.component';

@Component({
  selector: 'app-document-edit',
  standalone: true,
  imports: [
    CommonModule,
    ZardPageComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardTextEditorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-edit.component.html',
})
export class DocumentEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly documentId = signal<string | null>(null);
  readonly isNew = computed(() => !this.documentId());
  readonly editorContent = signal<string>('');
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly isFormValid = computed(() => {
    return this.editorContent().trim().length > 0;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.documentId.set(id);
    
    if (id) {
      this.loadDocument(id);
    }
  }

  loadDocument(id: string): void {
    this.isLoading.set(true);
    // TODO: Implement actual API call to load document
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  onEditorChange(html: string): void {
    this.editorContent.set(html);
  }

  onCancel(): void {
    this.router.navigate(['/document']);
  }

  onSave(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.isSaving.set(true);
    // TODO: Implement actual API call to save document
    setTimeout(() => {
      this.isSaving.set(false);
      this.router.navigate(['/document']);
    }, 1000);
  }
}

