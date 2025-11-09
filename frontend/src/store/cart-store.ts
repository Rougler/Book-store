"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Book, CartItem } from "@/lib/types";

type CartState = {
  items: CartItem[];
  totalQuantity: number;
  addItem: (book: Book, quantity?: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  removeItem: (bookId: number) => void;
  clearCart: () => void;
};

const recalculateTotal = (items: CartItem[]) =>
  items.reduce((accumulator, entry) => accumulator + entry.quantity, 0);

// Stable server snapshot - must be cached and never change
const SERVER_SNAPSHOT: CartState = {
  items: [],
  totalQuantity: 0,
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
};

const store = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalQuantity: 0,
      addItem: (book, quantity = 1) => {
        if (quantity < 1) {
          return;
        }

        const { items } = get();
        const existing = items.find((entry) => entry.book.id === book.id);

        const updatedItems = existing
          ? items.map((entry) =>
              entry.book.id === book.id
                ? { ...entry, quantity: entry.quantity + quantity }
                : entry,
            )
          : [...items, { book, quantity }];

        set({
          items: updatedItems,
          totalQuantity: recalculateTotal(updatedItems),
        });
      },
      updateQuantity: (bookId, quantity) => {
        if (quantity < 1) {
          return;
        }

        const updatedItems = get().items.map((entry) =>
          entry.book.id === bookId ? { ...entry, quantity } : entry,
        );

        set({
          items: updatedItems,
          totalQuantity: recalculateTotal(updatedItems),
        });
      },
      removeItem: (bookId) => {
        const updatedItems = get().items.filter((entry) => entry.book.id !== bookId);
        set({
          items: updatedItems,
          totalQuantity: recalculateTotal(updatedItems),
        });
      },
      clearCart: () => set({ items: [], totalQuantity: 0 }),
    }),
    {
      name: "bookstore-cart",
      partialize: (state) => ({ items: state.items, totalQuantity: state.totalQuantity }),
    },
  ),
);

// Global cache for server snapshots keyed by selector
// This ensures that getServerSnapshot returns the same value for the same logical selector
const serverSnapshotCache = new WeakMap<() => unknown, unknown>();

// Create SSR-safe hook wrapper
// The key insight: Both getSnapshot and getServerSnapshot must return the exact same value every time they're called
// This is critical for SSR and to avoid infinite loops
export const useCartStore = <T,>(selector: (state: CartState) => T): T => {
  // Get or compute the server snapshot for this selector
  const cached = serverSnapshotCache.get(selector as () => unknown);
  const serverSnapshot = (cached !== undefined ? cached : selector(SERVER_SNAPSHOT)) as T;
  
  // Cache the result for future use
  if (cached === undefined) {
    serverSnapshotCache.set(selector as () => unknown, serverSnapshot);
  }
  
  // Use ref to store the previous client snapshot value
  // This allows us to compare and only return a new value if it actually changed
  const prevSnapshotRef = useRef<T | undefined>(undefined);
  const prevSelectorRef = useRef(selector);

  // Create stable getSnapshot function that caches the result
  // This prevents infinite loops by ensuring the same value returns the same reference
  const getSnapshot = useCallback((): T => {
    const currentState = store.getState();
    const currentSnapshot = selector(currentState);
    
    // If selector changed, always return new value
    if (prevSelectorRef.current !== selector) {
      prevSelectorRef.current = selector;
      prevSnapshotRef.current = currentSnapshot;
      return currentSnapshot;
    }
    
    // For primitive values, return directly (they're compared by value)
    if (typeof currentSnapshot !== "object" || currentSnapshot === null) {
      return currentSnapshot;
    }
    
    // For objects/arrays, compare with previous value
    // If values are the same, return previous reference to maintain stability
    const prevSnapshot = prevSnapshotRef.current;
    if (prevSnapshot !== undefined) {
      // Simple shallow comparison for arrays
      if (Array.isArray(currentSnapshot) && Array.isArray(prevSnapshot)) {
        if (
          currentSnapshot.length === prevSnapshot.length &&
          currentSnapshot.every((item, idx) => item === prevSnapshot[idx])
        ) {
          return prevSnapshot;
        }
      }
      // For objects, do shallow comparison
      else if (
        !Array.isArray(currentSnapshot) &&
        !Array.isArray(prevSnapshot) &&
        typeof currentSnapshot === "object" &&
        typeof prevSnapshot === "object" &&
        currentSnapshot !== null &&
        prevSnapshot !== null
      ) {
        const currentKeys = Object.keys(currentSnapshot as Record<string, unknown>);
        const prevKeys = Object.keys(prevSnapshot as Record<string, unknown>);
        if (
          currentKeys.length === prevKeys.length &&
          currentKeys.every(
            (key) =>
              (currentSnapshot as Record<string, unknown>)[key] === (prevSnapshot as Record<string, unknown>)[key]
          )
        ) {
          return prevSnapshot;
        }
      }
    }
    
    // Values changed, update ref and return new value
    prevSnapshotRef.current = currentSnapshot;
    return currentSnapshot;
  }, [selector]);

  // Create getServerSnapshot as a stable function
  const getServerSnapshot = useCallback((): T => {
    return serverSnapshot;
  }, [serverSnapshot]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getServerSnapshot);
};

