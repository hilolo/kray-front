import Quill, { Blot } from 'quill';

const Inline = Quill.import('blots/inline');

export class TagBlot extends Inline {
  static blotName = 'tag';
  static tagName = 'span';
  static className = 'ql-tag';

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
    if (index === 0 && length === this.length()) {
      // If deleting the entire tag, remove it completely
      this.remove();
    } else {
      // Prevent partial deletion - remove entire tag if any part is deleted
      this.remove();
    }
  }

  // Prevent splitting the tag
  split(index: number, force?: boolean): Blot | null {
    if (index === 0) {
      return this;
    }
    if (index >= this.length()) {
      return this.next;
    }
    // Don't allow splitting tags - return null to prevent split
    return null;
  }
}

// Register the custom blot
Quill.register(TagBlot);
