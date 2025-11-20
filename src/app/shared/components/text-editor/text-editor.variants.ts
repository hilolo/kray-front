import { cva, VariantProps } from 'class-variance-authority';

export const textEditorVariants = cva(
  'w-full border rounded-md bg-background',
  {
    variants: {
      zSize: {
        default: 'min-h-[200px]',
        sm: 'min-h-[150px]',
        lg: 'min-h-[400px]',
        xl: 'min-h-[600px]',
      },
      zStatus: {
        default: 'border-input',
        error: 'border-destructive',
      },
    },
    defaultVariants: {
      zSize: 'default',
      zStatus: 'default',
    },
  },
);
export type ZardTextEditorVariants = VariantProps<typeof textEditorVariants>;

