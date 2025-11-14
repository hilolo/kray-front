import { cva, VariantProps } from 'class-variance-authority';

export const kanbanVariants = cva('flex gap-4 overflow-x-auto pb-4', {
  variants: {},
});

export const kanbanColumnVariants = cva('flex flex-col min-w-[300px] max-w-[300px]', {
  variants: {},
});

export const kanbanColumnHeaderVariants = cva('flex items-center gap-2 mb-4', {
  variants: {},
});

export const kanbanColumnTitleVariants = cva('text-sm font-semibold', {
  variants: {},
});

export const kanbanColumnCountVariants = cva('text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5', {
  variants: {},
});

export const kanbanCardVariants = cva(
  'bg-card border rounded-lg p-4 shadow-sm cursor-move hover:shadow-md transition-shadow',
  {
    variants: {},
  },
);

export type ZardKanbanVariants = VariantProps<typeof kanbanVariants>;
export type ZardKanbanColumnVariants = VariantProps<typeof kanbanColumnVariants>;
export type ZardKanbanCardVariants = VariantProps<typeof kanbanCardVariants>;

