import { cva, VariantProps } from 'class-variance-authority';

const timePickerVariants = cva('', {
  variants: {
    zSize: {
      sm: '',
      default: '',
      lg: '',
    },
    zType: {
      default: '',
      outline: '',
      ghost: '',
    },
  },
  defaultVariants: {
    zSize: 'default',
    zType: 'outline',
  },
});

export { timePickerVariants };
export type ZardTimePickerVariants = VariantProps<typeof timePickerVariants>;

