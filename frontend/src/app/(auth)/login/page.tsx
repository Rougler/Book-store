"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { InputField } from "@/components/ui/input-field";
import { SectionHeading } from "@/components/ui/section-heading";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/api-client";
import { AuthResponse } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      const result = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: values,
      });
      login(result.tokens, result.user);
      const redirectTo = searchParams.get("redirectTo") ?? "/";
      router.push(redirectTo);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to login.";
      alert(message);
    }
  };

  return (
    <div className="mx-auto mt-40 flex max-w-md flex-col gap-6">
      <SectionHeading title="Login" description="Sign in to access your account." />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <InputField id="email" label="Email" type="email" register={register} error={errors.email} autoComplete="email" />
        <InputField id="password" label="Password" type="password" register={register} error={errors.password} autoComplete="current-password" />
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Login"
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className="text-center text-sm text-slate-600">
        New here?{' '}
        <Link href="/register" className="font-semibold text-slate-900 hover:underline" aria-label="Go to registration page">
          Create an account
        </Link>
      </p>
    </div>
  );
}

