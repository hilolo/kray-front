import { cva, VariantProps } from 'class-variance-authority';

export const circularProgressVariants = cva('relative inline-flex items-center justify-center', {
  variants: {
    zSize: {
      sm: 'w-10 h-10',
      default: 'w-14 h-14',
      lg: 'w-20 h-20',
    },
    zType: {
      default: '',
      destructive: '',
      success: '',
      warning: '',
    },
  },
  defaultVariants: {
    zSize: 'default',
    zType: 'default',
  },
});

export type ZardCircularProgressVariants = VariantProps<typeof circularProgressVariants>;

