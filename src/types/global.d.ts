// src/types/global.d.ts
import 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Add data-ai-hint to all HTML elements
    'data-ai-hint'?: string;
  }
  // If you use Next.js Image component and want to allow it there too (experimental)
  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    'data-ai-hint'?: string;
  }
}

// For Next.js specific metadata types, if direct augmentation is complex,
// consider using `as any` for now or defining more specific augmentations
// if the exact types (OGImageDescriptor, Icon) can be precisely targeted.
// For simplicity in this step, focusing on JSX elements.
