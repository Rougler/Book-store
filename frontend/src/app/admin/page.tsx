"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { InputField } from "@/components/ui/input-field";
import { SectionHeading } from "@/components/ui/section-heading";
import { useAdminAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/api-client";
import { Tokens } from "@/lib/types";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, authenticate } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    try {
      const tokens = await apiRequest<Tokens>("/api/admin/login", {
        method: "POST",
        body: values,
        role: "admin",
      });
      authenticate(tokens);
      router.push("/admin/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to login.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <SectionHeading title="Admin Panel" description="Redirecting to dashboard..." />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <SectionHeading title="Admin Login" description="Sign in to access the admin panel." />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <InputField id="username" label="Username" register={register} error={errors.username} autoComplete="username" />
        <InputField id="password" label="Password" type="password" register={register} error={errors.password} autoComplete="current-password" />
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="mt-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Login"
        >
          {isSubmitting || isLoading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

