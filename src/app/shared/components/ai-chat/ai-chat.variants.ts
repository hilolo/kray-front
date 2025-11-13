import { cva, VariantProps } from 'class-variance-authority';

export const aiChatVariants = cva(
  'flex h-full bg-background overflow-hidden',
  {
    variants: {
      zSize: {
        default: 'min-h-[700px] max-h-[900px] w-full max-w-6xl border rounded-lg',
        sm: 'min-h-[500px] max-h-[700px] w-full max-w-4xl border rounded-lg',
        lg: 'min-h-[900px] max-h-[1100px] w-full max-w-7xl border rounded-lg',
        full: 'h-full w-full',
      },
    },
    defaultVariants: {
      zSize: 'default',
    },
  },
);

export const aiChatSidebarVariants = cva(
  'flex flex-col w-64 border-r bg-muted/30 overflow-hidden',
  {
    variants: {},
    defaultVariants: {},
  },
);

export const aiChatSidebarHeaderVariants = cva(
  'p-4 border-b',
  {
    variants: {},
    defaultVariants: {},
  },
);

export const aiChatSidebarContentVariants = cva(
  'flex-1 overflow-y-auto p-4 space-y-4',
  {
    variants: {},
    defaultVariants: {},
  },
);

export const aiChatSidebarFooterVariants = cva(
  'p-4 border-t space-y-2',
  {
    variants: {},
    defaultVariants: {},
  },
);

export const aiChatMainVariants = cva(
  'flex flex-col flex-1 overflow-hidden w-full',
  {
    variants: {},
    defaultVariants: {},
  },
);

export const aiChatMessagesVariants = cva(
  'flex-1 overflow-y-auto p-4 space-y-6 w-full',
  {
    variants: {},
    defaultVariants: {},
  },
);

export const aiChatMessageVariants = cva(
  'flex gap-4',
  {
    variants: {
      zRole: {
        user: 'justify-end',
        assistant: 'justify-start',
      },
    },
    defaultVariants: {
      zRole: 'user',
    },
  },
);

export const aiChatMessageContentVariants = cva(
  'rounded-lg px-4 py-3 max-w-[80%] break-words prose prose-sm dark:prose-invert',
  {
    variants: {
      zRole: {
        user: 'bg-primary text-primary-foreground',
        assistant: 'bg-muted text-foreground',
      },
    },
    defaultVariants: {
      zRole: 'user',
    },
  },
);

export const aiChatInputAreaVariants = cva(
  'border-t p-4 bg-background w-full',
  {
    variants: {},
    defaultVariants: {},
  },
);

export const aiChatInputContainerVariants = cva(
  'flex items-center gap-2 rounded-lg border bg-background px-3 py-2 w-full max-w-none',
  {
    variants: {},
    defaultVariants: {},
  },
);

export type ZardAiChatVariants = VariantProps<typeof aiChatVariants>;
export type ZardAiChatMessageVariants = VariantProps<typeof aiChatMessageVariants>;
export type ZardAiChatMessageContentVariants = VariantProps<typeof aiChatMessageContentVariants>;

