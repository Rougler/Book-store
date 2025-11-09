"use client";

import { useEffect } from "react";

type StatusModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
};

export const StatusModal = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoClose = false,
  autoCloseDelay = 3000,
}: StatusModalProps) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const typeStyles = {
    success: {
      icon: "✓",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconBg: "bg-green-100",
      iconText: "text-green-600",
      titleColor: "text-green-900",
      messageColor: "text-green-700",
    },
    error: {
      icon: "✕",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconBg: "bg-red-100",
      iconText: "text-red-600",
      titleColor: "text-red-900",
      messageColor: "text-red-700",
    },
    info: {
      icon: "ℹ",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      titleColor: "text-blue-900",
      messageColor: "text-blue-700",
    },
    warning: {
      icon: "⚠",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconBg: "bg-yellow-100",
      iconText: "text-yellow-600",
      titleColor: "text-yellow-900",
      messageColor: "text-yellow-700",
    },
  };

  const styles = typeStyles[type];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
      aria-describedby="status-modal-message"
      tabIndex={-1}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-md rounded-3xl border-2 ${styles.borderColor} ${styles.bgColor} p-6 shadow-2xl transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${styles.iconBg} text-2xl font-bold ${styles.iconText} shadow-md`}
          >
            {styles.icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 id="status-modal-title" className={`mb-2 text-lg font-bold ${styles.titleColor}`}>
              {title}
            </h3>
            <p id="status-modal-message" className={`text-sm leading-relaxed ${styles.messageColor}`}>
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Close modal"
            tabIndex={0}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

