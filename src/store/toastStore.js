import { create } from "zustand";

const toastStore = create((set) => ({
  toasts: [],
  
  showToast: (message, type = "success") => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    // Auto-remove toast after 4 seconds
    if (type !== "confirm") {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, 4000);
    }
  },

  showConfirm: (message, onConfirm, onCancel) => {
    const id = Date.now();
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id,
          message,
          type: "confirm",
          onConfirm: () => {
            if (onConfirm) onConfirm();
            set((state) => ({
              toasts: state.toasts.filter((t) => t.id !== id),
            }));
          },
          onCancel: () => {
            if (onCancel) onCancel();
            set((state) => ({
              toasts: state.toasts.filter((t) => t.id !== id),
            }));
          },
        },
      ],
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export default toastStore;
