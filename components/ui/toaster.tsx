'use client';

import { Toaster as SonnerToaster } from 'sonner';

// Lightweight wrapper around sonner. Centralizes default styling.
// Mount once in the [locale] layout (or app layout). Anywhere else, import
// `toast` from 'sonner' to fire notifications.
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      duration={5000}
      toastOptions={{
        classNames: {
          toast: 'font-sans',
        },
      }}
    />
  );
}
