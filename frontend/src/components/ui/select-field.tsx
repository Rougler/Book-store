"use client";

import { FieldError, UseFormRegister } from "react-hook-form";

type Option = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  id: string;
  label: string;
  options: Option[];
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  defaultValue?: string;
};

export const SelectField = ({ id, label, options, register, error, required, defaultValue }: SelectFieldProps) => {
  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <select
        id={id}
        defaultValue={defaultValue}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...register(id, { required })}
      >
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span id={`${id}-error`} className="text-xs text-rose-600">
          {error.message}
        </span>
      ) : null}
    </label>
  );
};

