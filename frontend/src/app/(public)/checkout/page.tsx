"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmptyState } from "@/components/ui/empty-state";
import { InputField } from "@/components/ui/input-field";
import { SectionHeading } from "@/components/ui/section-heading";
import { apiRequest } from "@/lib/api-client";
import { useCartStore } from "@/store/cart-store";

const checkoutSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().optional(),
  address: z.string().min(1, "Address is required."),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  zip_code: z.string().min(3, "Zip is required."),
  phone: z.string().optional(),
  country: z.string().min(1, "Country is required."),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore((state) => ({
    items: state.items,
    clearCart: state.clearCart,
  }));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "United States",
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      return;
    }

    const payload = {
      ...data,
      items: items.map((entry) => ({ book_id: entry.book.id, quantity: entry.quantity })),
    };

    try {
      const response = await apiRequest<{ id: number } & Record<string, unknown>>("/api/orders/books", {
        method: "POST",
        body: payload,
        requireAuth: false,
      });
      clearCart();
      router.push(`/checkout/success?orderId=${response.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to complete order.";
      alert(message);
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add some books before checking out."
        action={
          <a
            href="/browse"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            aria-label="Browse books"
          >
            Browse books
          </a>
        }
      />
    );
  }

  const subtotal = items.reduce((total, entry) => total + entry.book.price * entry.quantity, 0);

  return (
    <div className="space-y-8">
      <SectionHeading title="Checkout" description="Provide your details to place the order." />
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.4fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField id="email" label="Email" type="email" register={register} error={errors.email} autoComplete="email" />
            <InputField id="first_name" label="First name" register={register} error={errors.first_name} autoComplete="given-name" />
            <InputField id="last_name" label="Last name" register={register} error={errors.last_name} autoComplete="family-name" />
            <InputField id="phone" label="Phone" register={register} error={undefined} autoComplete="tel" inputMode="tel" />
            <InputField id="address" label="Address" register={register} error={errors.address} autoComplete="street-address" />
            <InputField id="city" label="City" register={register} error={errors.city} autoComplete="address-level2" />
            <InputField id="state" label="State" register={register} error={errors.state} autoComplete="address-level1" />
            <InputField id="zip_code" label="Zip Code" register={register} error={errors.zip_code} autoComplete="postal-code" />
            <InputField id="country" label="Country" register={register} error={errors.country} autoComplete="country" />
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Order summary</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            {items.map(({ book, quantity }) => (
              <li key={book.id} className="flex justify-between">
                <span>
                  {book.title} × {quantity}
                </span>
                <span>₹{(book.price * quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            aria-label="Place order"
          >
            {isSubmitting ? "Placing order..." : "Place order"}
          </button>
        </div>
      </form>
    </div>
  );
}

