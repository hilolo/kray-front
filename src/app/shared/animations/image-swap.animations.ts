import { trigger, transition, style, animate, query, group } from '@angular/animations';

/**
 * Animation for swapping images horizontally
 * Direction: 'next' slides current image left and new image from right
 * Direction: 'prev' slides current image right and new image from left
 */
export const imageSwapAnimation = trigger('imageSwap', [
  transition('* => next', [
    // Animate the current image sliding out to the left
    group([
      query(':leave', [
        animate('300ms ease-in-out', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ], { optional: true }),
      // Animate the new image sliding in from the right
      query(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-in-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ], { optional: true })
    ])
  ]),
  transition('* => prev', [
    // Animate the current image sliding out to the right
    group([
      query(':leave', [
        animate('300ms ease-in-out', style({ transform: 'translateX(100%)', opacity: 0 }))
      ], { optional: true }),
      // Animate the new image sliding in from the left
      query(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-in-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ], { optional: true })
    ])
  ])
]);

/**
 * Gallery-style smooth animation for image transitions
 * Features:
 * - Smooth cross-fade with subtle slide
 * - Gentle scale effect for depth
 * - Professional easing curve for natural motion
 * - Optimized duration for smooth gallery feel
 */
export const imageSlideAnimation = trigger('imageSlide', [
  transition('* => next', [
    style({ 
      transform: 'translateX(20px) scale(0.99)', 
      opacity: 0
    }),
    animate('450ms cubic-bezier(0.33, 1, 0.68, 1)', style({ 
      transform: 'translateX(0) scale(1)', 
      opacity: 1
    }))
  ]),
  transition('* => prev', [
    style({ 
      transform: 'translateX(-20px) scale(0.99)', 
      opacity: 0
    }),
    animate('450ms cubic-bezier(0.33, 1, 0.68, 1)', style({ 
      transform: 'translateX(0) scale(1)', 
      opacity: 1
    }))
  ]),
  // Allow transitions from empty state
  transition('void => next', [
    style({ 
      transform: 'translateX(20px) scale(0.99)', 
      opacity: 0
    }),
    animate('450ms cubic-bezier(0.33, 1, 0.68, 1)', style({ 
      transform: 'translateX(0) scale(1)', 
      opacity: 1
    }))
  ]),
  transition('void => prev', [
    style({ 
      transform: 'translateX(-20px) scale(0.99)', 
      opacity: 0
    }),
    animate('450ms cubic-bezier(0.33, 1, 0.68, 1)', style({ 
      transform: 'translateX(0) scale(1)', 
      opacity: 1
    }))
  ])
]);

