"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  payment_method: z.enum(["cod", "upi"], {
    required_error: "Please select a payment method",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore((state) => ({
    items: state.items,
    clearCart: state.clearCart,
  }));
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "India",
      payment_method: "cod",
    },
  });

  const selectedPaymentMethod = watch("payment_method");

  const handleRazorpayPayment = async (orderId: number, amount: number, customerDetails: CheckoutFormValues) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please refresh the page.");
      setIsProcessingPayment(false);
      return;
    }

    try {
      // Create Razorpay order
      const razorpayOrder = await apiRequest<{ id: string; amount: number; currency: string }>("/api/payments/create-order", {
        method: "POST",
        body: {
          amount: Math.round(amount * 100), // Convert to paise
          currency: "INR",
          receipt: `order_${orderId}`,
        },
        requireAuth: false,
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag", // Replace with your Razorpay key
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Gyaan AUR Dhan",
        description: `Order #${orderId}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            await apiRequest("/api/payments/verify", {
              method: "POST",
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderId,
              },
              requireAuth: false,
            });

            clearCart();
            router.push(`/checkout/success?orderId=${orderId}`);
          } catch (error) {
            alert("Payment verification failed. Please contact support.");
            console.error("Payment verification error:", error);
          }
        },
        prefill: {
          name: `${customerDetails.first_name} ${customerDetails.last_name || ""}`.trim(),
          email: customerDetails.email,
          contact: customerDetails.phone || "",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setIsProcessingPayment(false);
    } catch (error) {
      setIsProcessingPayment(false);
      const message = error instanceof Error ? error.message : "Failed to initialize payment.";
      
      // Check if it's a configuration error
      if (message.includes("authentication") || message.includes("not configured")) {
        alert(
          "Razorpay is not configured. Please contact the administrator or use Cash on Delivery (COD) instead.\n\n" +
          "To enable UPI payments, Razorpay keys need to be configured in the backend."
        );
      } else {
        alert(message);
      }
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      return;
    }

    const payload = {
      ...data,
      items: items.map((entry) => ({ book_id: entry.book.id, quantity: entry.quantity })),
    };

    try {
      // Create order first
      const response = await apiRequest<{ id: number } & Record<string, unknown>>("/api/orders/books", {
        method: "POST",
        body: payload,
        requireAuth: false,
      });

      const orderId = response.id;
      const subtotal = items.reduce((total, entry) => total + entry.book.price * entry.quantity, 0);

      // Handle payment based on method
      if (data.payment_method === "cod") {
        // Cash on Delivery - no payment processing needed
        clearCart();
        router.push(`/checkout/success?orderId=${orderId}`);
      } else if (data.payment_method === "upi") {
        // UPI via Razorpay
        setIsProcessingPayment(true);
        await handleRazorpayPayment(orderId, subtotal, data);
      }
    } catch (error: unknown) {
      setIsProcessingPayment(false);
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
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="space-y-8">
        <SectionHeading title="Checkout" description="Provide your details to place the order." />
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.4fr)]">
          <div className="space-y-6">
            {/* Shipping Details */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Shipping Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField id="email" label="Email" type="email" register={register} error={errors.email} autoComplete="email" />
                <InputField id="first_name" label="First name" register={register} error={errors.first_name} autoComplete="given-name" />
                <InputField id="last_name" label="Last name" register={register} error={errors.last_name} autoComplete="family-name" />
                <InputField id="phone" label="Phone" register={register} error={undefined} autoComplete="tel" inputMode="tel" />
                <InputField id="address" label="Address" register={register} error={errors.address} autoComplete="street-address" className="sm:col-span-2" />
                <InputField id="city" label="City" register={register} error={errors.city} autoComplete="address-level2" />
                <InputField id="state" label="State" register={register} error={errors.state} autoComplete="address-level1" />
                <InputField id="zip_code" label="Zip Code" register={register} error={errors.zip_code} autoComplete="postal-code" />
                <InputField id="country" label="Country" register={register} error={errors.country} autoComplete="country" />
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Payment Method</h3>
              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                    selectedPaymentMethod === "cod"
                      ? "border-indigo-500 bg-indigo-50/50"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                  }`}
                >
                  <input
                    type="radio"
                    value="cod"
                    {...register("payment_method")}
                    className="h-5 w-5 cursor-pointer text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💵</span>
                      <span className="font-semibold text-slate-900">Cash on Delivery (COD)</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">Pay when you receive your order</p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                    selectedPaymentMethod === "upi"
                      ? "border-indigo-500 bg-indigo-50/50"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                  }`}
                >
                  <input
                    type="radio"
                    value="upi"
                    {...register("payment_method")}
                    className="h-5 w-5 cursor-pointer text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📱</span>
                      <span className="font-semibold text-slate-900">UPI Payment</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">Pay securely via UPI (Google Pay, PhonePe, Paytm, etc.)</p>
                    <p className="mt-1 text-xs text-amber-600">
                      ⚠️ Requires Razorpay configuration. Use COD if not available.
                    </p>
                  </div>
                </label>
              </div>
              {errors.payment_method && (
                <p className="mt-2 text-sm text-red-600">{errors.payment_method.message}</p>
              )}
            </div>
          </div>

          {/* Order Summary */}
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
              disabled={isSubmitting || isProcessingPayment}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              aria-label="Place order"
            >
              {isProcessingPayment
                ? "Processing..."
                : isSubmitting
                  ? "Placing order..."
                  : selectedPaymentMethod === "cod"
                    ? "Place Order (COD)"
                    : "Pay with UPI"}
            </button>
            {selectedPaymentMethod === "cod" && (
              <p className="text-xs text-center text-slate-500">You will pay ₹{subtotal.toFixed(2)} when you receive your order</p>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

