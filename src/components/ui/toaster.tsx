"use client";

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts } = useToast();
  console.log("Toaster 렌더링됨, toasts 개수:", toasts.length, "toasts:", toasts);

  return (
    <ToastProvider swipeDirection="down" duration={1800}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        console.log("Toast 렌더링됨, id:", id, "title:", title, "props:", props);
        return (
          <Toast key={id} duration={1800} {...props}>
            <div className="flex flex-1 items-center justify-center">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}


