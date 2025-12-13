"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/api-client";
import { AuthResponse, UserProfile } from "@/lib/types";

const registerSchema = z
  .object({
    full_name: z.string().min(1, "Full name is required."),
    email: z.string().email("Please enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm_password: z.string().min(8, "Confirm password is required."),
    phone: z.string().min(10, "Phone number is required."),
    aadhaar: z.string().min(12, "Aadhaar number must be 12 digits.").max(12, "Aadhaar number must be 12 digits."),
    pan: z.string().min(10, "PAN number must be 10 characters.").max(10, "PAN number must be 10 characters."),
    bank_name: z.string().min(1, "Bank name is required."),
    branch_state: z.string().min(1, "Branch state is required."),
    ifsc_code: z.string().min(11, "IFSC code must be 11 characters.").max(11, "IFSC code must be 11 characters.").regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "IFSC code format is invalid (e.g., ABCD0123456)."),
    account_number: z.string().min(9, "Account number must be at least 9 digits.").max(18, "Account number must not exceed 18 digits."),
    referrer_code: z.string().optional(),
    terms: z.boolean().refine((value) => value, {
      message: "You must agree to the terms and conditions.",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords must match.",
    path: ["confirm_password"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

const bankOptions = [
  { value: "", label: "Select Bank" },
  { value: "State Bank of India", label: "State Bank of India" },
  { value: "HDFC Bank", label: "HDFC Bank" },
  { value: "ICICI Bank", label: "ICICI Bank" },
  { value: "Axis Bank", label: "Axis Bank" },
  { value: "Kotak Mahindra Bank", label: "Kotak Mahindra Bank" },
  { value: "Punjab National Bank", label: "Punjab National Bank" },
  { value: "Bank of Baroda", label: "Bank of Baroda" },
  { value: "Canara Bank", label: "Canara Bank" },
  { value: "Union Bank of India", label: "Union Bank of India" },
  { value: "Indian Bank", label: "Indian Bank" },
  { value: "Central Bank of India", label: "Central Bank of India" },
  { value: "IDBI Bank", label: "IDBI Bank" },
  { value: "Yes Bank", label: "Yes Bank" },
  { value: "IndusInd Bank", label: "IndusInd Bank" },
  { value: "Federal Bank", label: "Federal Bank" },
  { value: "South Indian Bank", label: "South Indian Bank" },
  { value: "Karur Vysya Bank", label: "Karur Vysya Bank" },
  { value: "Other", label: "Other" },
];

const stateOptions = [
  { value: "", label: "Select State" },
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Manipur", label: "Manipur" },
  { value: "Meghalaya", label: "Meghalaya" },
  { value: "Mizoram", label: "Mizoram" },
  { value: "Nagaland", label: "Nagaland" },
  { value: "Odisha", label: "Odisha" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Sikkim", label: "Sikkim" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Tripura", label: "Tripura" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Delhi", label: "Delhi" },
  { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
];

const InputWithIcon = ({
  id,
  label,
  icon,
  error,
  register,
  type = "text",
  placeholder,
  ...props
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: { message?: string };
  register: ReturnType<typeof useForm<RegisterValues>>["register"];
  type?: string;
  placeholder?: string;
  [key: string]: unknown;
}) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
        {icon}
      </div>
      <input
        id={id}
        type={type}
        {...register(id as keyof RegisterValues)}
        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 text-sm"
        placeholder={placeholder}
        {...props}
      />
    </div>
    {error && (
      <p className="text-xs text-rose-600 flex items-center gap-1">
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error.message}
      </p>
    )}
  </div>
);

const SelectWithIcon = ({
  id,
  label,
  icon,
  error,
  register,
  options,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: { message?: string };
  register: ReturnType<typeof useForm<RegisterValues>>["register"];
  options: { value: string; label: string }[];
}) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
        {icon}
      </div>
      <select
        id={id}
        {...register(id as keyof RegisterValues)}
        className="w-full pl-12 pr-10 py-3 rounded-xl border-2 border-slate-200 bg-white/50 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 text-sm appearance-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    {error && (
      <p className="text-xs text-rose-600 flex items-center gap-1">
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error.message}
      </p>
    )}
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const referrerCode = searchParams.get("ref");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      referrer_code: referrerCode || "",
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await apiRequest<UserProfile>("/api/auth/register", {
        method: "POST",
        body: {
          full_name: values.full_name,
          email: values.email,
          password: values.password,
          phone: values.phone,
          aadhaar: values.aadhaar,
          pan: values.pan,
          bank_name: values.bank_name,
          branch_state: values.branch_state,
          ifsc_code: values.ifsc_code,
          account_number: values.account_number,
          referrer_code: values.referrer_code,
        },
      });

      const loginResponse = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: {
          email: values.email,
          password: values.password,
        },
      });

      login(loginResponse.tokens, loginResponse.user);
      router.push("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to register.";
      alert(message);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegisterValues)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["full_name", "email", "phone", "password", "confirm_password"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["aadhaar", "pan", "bank_name", "branch_state", "ifsc_code", "account_number"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const steps = [
    { number: 1, title: "Personal", icon: "👤" },
    { number: 2, title: "Verification", icon: "🔒" },
    { number: 3, title: "Complete", icon: "🎉" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-gradient-to-r from-emerald-500/15 to-teal-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25 mb-6">
            <span className="text-3xl">🚀</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent sm:text-4xl">
            Join Gyaan AUR Dhan
          </h1>
          <p className="mt-3 text-slate-600">
            Start your journey towards knowledge, wealth, and leadership excellence
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex flex-col items-center ${currentStep >= step.number ? "opacity-100" : "opacity-50"}`}>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-300 ${currentStep > step.number
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                      : currentStep === step.number
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-110"
                        : "bg-slate-200 text-slate-500"
                    }`}
                >
                  {currentStep > step.number ? "✓" : step.icon}
                </div>
                <span className={`mt-2 text-xs font-medium ${currentStep >= step.number ? "text-slate-900" : "text-slate-500"}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 sm:w-24 h-1 mx-2 rounded-full transition-all duration-300 ${currentStep > step.number ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[2rem] blur opacity-20" />

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl"
          >
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in-scale">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">👤</span> Personal Information
                </h2>

                <InputWithIcon
                  id="full_name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                  register={register}
                  error={errors.full_name}
                />

                <InputWithIcon
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>}
                  register={register}
                  error={errors.email}
                />

                <InputWithIcon
                  id="phone"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                  register={register}
                  error={errors.phone}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputWithIcon
                    id="password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                    register={register}
                    error={errors.password}
                  />

                  <InputWithIcon
                    id="confirm_password"
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                    register={register}
                    error={errors.confirm_password}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Verification & Bank Details */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in-scale">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🔒</span> KYC & Bank Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputWithIcon
                    id="aadhaar"
                    label="Aadhaar Number"
                    placeholder="12 digit Aadhaar"
                    icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>}
                    register={register}
                    error={errors.aadhaar}
                  />

                  <InputWithIcon
                    id="pan"
                    label="PAN Number"
                    placeholder="10 character PAN"
                    icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    register={register}
                    error={errors.pan}
                  />
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>🏦</span> Bank Account Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectWithIcon
                      id="bank_name"
                      label="Bank Name"
                      icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                      register={register}
                      error={errors.bank_name}
                      options={bankOptions}
                    />

                    <SelectWithIcon
                      id="branch_state"
                      label="Branch State"
                      icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                      register={register}
                      error={errors.branch_state}
                      options={stateOptions}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputWithIcon
                      id="ifsc_code"
                      label="IFSC Code"
                      placeholder="e.g., ABCD0123456"
                      icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>}
                      register={register}
                      error={errors.ifsc_code}
                    />

                    <InputWithIcon
                      id="account_number"
                      label="Account Number"
                      placeholder="Enter account number"
                      icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                      register={register}
                      error={errors.account_number}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Final Step */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in-scale">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🎉</span> Almost There!
                </h2>

                <InputWithIcon
                  id="referrer_code"
                  label="Referral Code (Optional)"
                  placeholder="Enter referral code if you have one"
                  icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                  register={register}
                  error={errors.referrer_code}
                />

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("terms")}
                      className="mt-1 h-5 w-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700">
                      I agree to the{" "}
                      <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 underline">
                        Gyaan AUR Dhan terms and conditions
                      </a>
                      {" "}and{" "}
                      <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.terms.message}
                    </p>
                  )}
                </div>

                {/* Benefits Preview */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: "📚", label: "Premium Books" },
                    { icon: "💰", label: "Earn Rewards" },
                    { icon: "🤝", label: "Community" },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-3 rounded-xl bg-white/50 border border-slate-100">
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-xs font-medium text-slate-600">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all"
                >
                  Continue
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Start Your Journey
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Sign In Link */}
        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
