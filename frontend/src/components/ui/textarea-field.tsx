"use client";

import { FieldError, UseFormRegister } from "react-hook-form";

type TextareaFieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  rows?: number;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
};

export const TextareaField = ({
  id,
  label,
  placeholder,
  rows = 4,
  register,
  error,
  required,
  minLength,
  maxLength,
}: TextareaFieldProps) => {
  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <textarea
        id={id}
        placeholder={placeholder}
        rows={rows}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...register(id, {
          required,
          minLength,
          maxLength,
        })}
      />
      {error ? (
        <span id={`${id}-error`} className="text-xs text-rose-600">
          {error.message}
        </span>
      ) : null}
    </label>
  );
};

