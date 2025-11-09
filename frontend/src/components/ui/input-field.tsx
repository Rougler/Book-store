"use client";

import { FieldError, UseFormRegister } from "react-hook-form";

type InputFieldProps = {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

export const InputField = ({
  id,
  label,
  type = "text",
  autoComplete,
  placeholder,
  register,
  error,
  required,
  minLength,
  maxLength,
  disabled,
  inputMode,
}: InputFieldProps) => {
  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        inputMode={inputMode}
        {...register(id, {
          required,
          minLength,
          maxLength,
        })}
        disabled={disabled}
      />
      {error ? (
        <span id={`${id}-error`} className="text-xs text-rose-600">
          {error.message}
        </span>
      ) : null}
    </label>
  );
};

