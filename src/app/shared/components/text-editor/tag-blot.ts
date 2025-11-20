import Quill from 'quill';

const Inline = Quill.import('blots/inline') as any;
const Parchment = Quill.import('parchment') as any;

export class TagBlot extends Inline {
  static blotName = 'tag';
  static tagName = 'span';
  static className = 'ql-tag';
  static scope = Parchment.Scope.INLINE;

  static create(value: { field: string; value: string }): HTMLElement {
    const node = super.create() as HTMLElement;
    node.setAttribute('data-field', value.field);
    node.setAttribute('data-value', value.value);
    node.textContent = value.field;
    return node;
  }

  static value(node: HTMLElement): { field: string; value: string } {
    return {
      field: node.getAttribute('data-field') || '',
      value: node.getAttribute('data-value') || '',
    };
  }

  static formats(node: HTMLElement): { field: string; value: string } {
    return this.value(node);
  }

  // Override deleteAt to handle tag deletion
  deleteAt(index: number, length: number): void {
    if (index === 0 && length === (this as any).length()) {
      // If deleting the entire tag, remove it completely
      (this as any).remove();
    } else {
      // Prevent partial deletion - remove entire tag if any part is deleted
      (this as any).remove();
    }
  }

  // Prevent splitting the tag
  split(index: number, force?: boolean): any {
    if (index === 0) {
      return this;
    }
    if (index >= (this as any).length()) {
      return (this as any).next;
    }
    // Don't allow splitting tags - return null to prevent split
    return null;
  }
}

// Register the custom blot
Quill.register(TagBlot, true);
