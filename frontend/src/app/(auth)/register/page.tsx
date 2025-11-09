"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { SectionHeading } from "@/components/ui/section-heading";
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

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const referrerCode = searchParams.get("ref");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <SectionHeading
        title="Join Gyaan AUR Dhan"
        description="Start your journey towards knowledge, wealth, and leadership excellence."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <InputField id="full_name" label="Full name" register={register} error={errors.full_name} autoComplete="name" />
        <InputField id="email" label="Email" type="email" register={register} error={errors.email} autoComplete="email" />
        <InputField id="phone" label="Phone" register={register} error={errors.phone} inputMode="tel" autoComplete="tel" />
        <InputField id="password" label="Password" type="password" register={register} error={errors.password} autoComplete="new-password" />
        <InputField id="confirm_password" label="Confirm password" type="password" register={register} error={errors.confirm_password} autoComplete="new-password" />
        <InputField id="aadhaar" label="Aadhaar Number" register={register} error={errors.aadhaar} />
        <InputField id="pan" label="PAN Number" register={register} error={errors.pan} />
        
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Bank Account Details</h3>
          <SelectField
            id="bank_name"
            label="Bank Name *"
            register={register}
            error={errors.bank_name}
            required
            options={[
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
            ]}
          />
          <SelectField
            id="branch_state"
            label="Branch State *"
            register={register}
            error={errors.branch_state}
            required
            options={[
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
              { value: "Andaman and Nicobar Islands", label: "Andaman and Nicobar Islands" },
              { value: "Chandigarh", label: "Chandigarh" },
              { value: "Dadra and Nagar Haveli and Daman and Diu", label: "Dadra and Nagar Haveli and Daman and Diu" },
              { value: "Delhi", label: "Delhi" },
              { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
              { value: "Ladakh", label: "Ladakh" },
              { value: "Lakshadweep", label: "Lakshadweep" },
              { value: "Puducherry", label: "Puducherry" },
            ]}
          />
          <InputField
            id="ifsc_code"
            label="IFSC Code *"
            register={register}
            error={errors.ifsc_code}
            placeholder="e.g., ABCD0123456"
            autoComplete="off"
          />
          <InputField
            id="account_number"
            label="Account Number *"
            register={register}
            error={errors.account_number}
            inputMode="numeric"
            placeholder="Enter account number"
          />
        </div>
        
        <InputField
          id="referrer_code"
          label="Referral Code (Optional)"
          register={register}
          error={errors.referrer_code}
          placeholder="Enter referral code if you have one"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" {...register("terms")} className="h-4 w-4 rounded border-slate-300" aria-label="Agree to terms" />
          I agree to the{' '}
          <a href="#" className="font-semibold text-slate-900 hover:underline" aria-label="View terms and conditions">
            Gyaan AUR Dhan terms and conditions
          </a>
        </label>
        {errors.terms ? <p className="text-xs text-rose-600">{errors.terms.message}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Register"
        >
          {isSubmitting ? "Creating account..." : "Start Your Journey"}
        </button>
      </form>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-slate-900 hover:underline" aria-label="Go to login page">
          Login
        </Link>
      </p>
    </div>
  );
}

