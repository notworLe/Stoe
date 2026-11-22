"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  type BookingDetails,
  type CartItem,
  type Product,
  type RentalDays,
} from "@/types";

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (
    product: Product,
    size: string,
    rentalDays: RentalDays,
    bookingDetails: BookingDetails,
    openDrawer?: boolean
  ) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotalAud: number;
  deliveryTotalAud: number;
  afterHoursTotalAud: number;
  grandTotalAud: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "maisondelua_cart_v2";
const EMPTY_ITEMS: CartItem[] = [];

let memoryItems: CartItem[] = [];
let isInitialized = false;
const listeners = new Set<() => void>();

function notifyCartListeners() {
  listeners.forEach((listener) => listener());
}

function getCartSnapshot(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_ITEMS;
  if (!isInitialized) {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          memoryItems = parsed;
        }
      }
    } catch {
      memoryItems = [];
    }
    isInitialized = true;
  }
  return memoryItems;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_ITEMS;
}

function saveCartItems(newItems: CartItem[]) {
  memoryItems = newItems;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems));
    } catch {
      // Ignore storage quota errors
    }
  }
  notifyCartListeners();
}

function subscribeCart(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerSnapshot
  );
  const [isOpen, setIsOpen] = useState(false);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addItem = (
    product: Product,
    size: string,
    rentalDays: RentalDays,
    bookingDetails: BookingDetails,
    openDrawer: boolean = true
  ) => {
    const rentalFeeAud = Math.round(bookingDetails.rentalFeeAud * 100) / 100;
    const deliveryFeeAud = Math.round(bookingDetails.deliveryFeeAud * 100) / 100;
    const afterHoursFeeAud = Math.round(bookingDetails.afterHoursFeeAud * 100) / 100;
    const pricePerItemAud =
      Math.round((rentalFeeAud + deliveryFeeAud + afterHoursFeeAud) * 100) / 100;

    // Each garment piece is unique physical inventory per date window
    const cartItemId = `${product.id}-${size}-${rentalDays}-${bookingDetails.deliveryMethod}-${bookingDetails.startDate}`;

    const currentItems = getCartSnapshot();
    const existingIndex = currentItems.findIndex((item) => item.id === cartItemId);

    const newItem: CartItem = {
      id: cartItemId,
      product,
      size,
      rentalDays,
      quantity: 1,
      rentalFeeAud,
      deliveryFeeAud,
      afterHoursFeeAud,
      pricePerItemAud,
      bookingDetails,
    };

    const updated =
      existingIndex > -1
        ? currentItems.map((item, idx) => (idx === existingIndex ? newItem : item))
        : [...currentItems, newItem];

    saveCartItems(updated);
    if (openDrawer) {
      setIsOpen(true);
    }
  };

  const removeItem = (itemId: string) => {
    const currentItems = getCartSnapshot();
    saveCartItems(currentItems.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    saveCartItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalAud =
    Math.round(
      items.reduce((sum, item) => sum + item.rentalFeeAud * item.quantity, 0) * 100
    ) / 100;
  const deliveryTotalAud =
    Math.round(
      items.reduce((sum, item) => sum + item.deliveryFeeAud * item.quantity, 0) * 100
    ) / 100;
  const afterHoursTotalAud =
    Math.round(
      items.reduce((sum, item) => sum + item.afterHoursFeeAud * item.quantity, 0) * 100
    ) / 100;
  const grandTotalAud =
    Math.round((subtotalAud + deliveryTotalAud + afterHoursTotalAud) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        clearCart,
        totalItems,
        subtotalAud,
        deliveryTotalAud,
        afterHoursTotalAud,
        grandTotalAud,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within <CartProvider>");
  }
  return context;
}
