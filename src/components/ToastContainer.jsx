import toastStore from "../store/toastStore";

function ToastContainer() {
  const { toasts, removeToast } = toastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] flex flex-col gap-3 max-w-sm w-[90%] sm:w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";
        const isWarning = toast.type === "warning";
        const isConfirm = toast.type === "confirm";

        let bgClass = "bg-zinc-800 border-zinc-700 text-white";
        let icon = null;

        if (isSuccess) {
          bgClass = "bg-emerald-950/90 border-emerald-800/80 text-emerald-200 backdrop-blur-md";
          icon = (
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        } else if (isError) {
          bgClass = "bg-rose-950/90 border-rose-800/80 text-rose-200 backdrop-blur-md";
          icon = (
            <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        } else if (isWarning) {
          bgClass = "bg-amber-950/90 border-amber-800/80 text-amber-200 backdrop-blur-md";
          icon = (
            <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          );
        } else if (isConfirm) {
          bgClass = "bg-zinc-900/95 border-zinc-750 text-zinc-100 backdrop-blur-md p-5 flex-col items-stretch";
          icon = (
            <div className="flex gap-3 items-start">
              <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1 text-sm font-semibold leading-snug">{toast.message}</div>
            </div>
          );
        }

        return (
          <div
            key={toast.id}
            className={`flex gap-3 p-4 rounded-xl border shadow-2xl pointer-events-auto transition-all duration-300 animate-in zoom-in-95 fade-in duration-200 ${bgClass}`}
          >
            {isConfirm ? (
              <>
                {icon}
                <div className="mt-3.5 flex gap-2 justify-end">
                  <button
                    onClick={toast.onCancel}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={toast.onConfirm}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-655 text-white transition cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </>
            ) : (
              <>
                {icon}
                <div className="flex-1 text-sm font-semibold leading-snug">{toast.message}</div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-current opacity-60 hover:opacity-100 transition shrink-0 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;
