"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { type Product, type CartItem, type BookingDetails } from "@/types";

/**
 * =====================================================================
 * CONTEXT: CartContext (Hệ thống Quản lý Giỏ hàng Đặt thuê Áo Dài)
 * =====================================================================
 * Hướng dẫn cho người mới học (Newbie Developer):
 * - Sử dụng kiến trúc `useSyncExternalStore` chuẩn React 19:
 *   1. Đồng bộ an toàn giữa bộ nhớ trình duyệt (localStorage) và React state.
 *   2. Không gây lỗi Hydration Mismatch giữa Server và Client.
 *   3. Tránh hoàn toàn lỗi cascading render (`react-hooks/set-state-in-effect`).
 *   4. Khi khách chuyển trang hoặc mở lại tab, các áo dài đã chọn vẫn được lưu nguyên vẹn.
 * =====================================================================
 */

interface CartContextType {
  /** Danh sách món đồ trong giỏ */
  items: CartItem[];
  /** Trạng thái mở/đóng ngăn kéo giỏ hàng */
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  /** Thêm áo dài vào giỏ kèm chi tiết booking (ngày giờ lấy/trả, phương thức nhận) */
  addItem: (
    product: Product,
    size: string,
    rentalDays?: number,
    quantity?: number,
    bookingDetails?: BookingDetails
  ) => void;
  /** Xóa món đồ khỏi giỏ */
  removeItem: (itemId: string) => void;
  /** Cập nhật số lượng (+1 hoặc -1) */
  updateQuantity: (itemId: string, delta: number) => void;
  /** Xóa sạch giỏ hàng */
  clearCart: () => void;
  /** Tổng số lượng món đồ */
  totalItems: number;
  /** Tổng tiền tạm tính theo AUD */
  subtotalAud: number;
  /** Tổng tiền tạm tính theo VND */
  subtotalVnd: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "lua_studio_cart_v1";
const EMPTY_ITEMS: CartItem[] = [];

// Bộ nhớ đệm ngoài React (External Store)
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
        memoryItems = JSON.parse(saved);
      }
    } catch {
      // bỏ qua nếu dữ liệu storage lỗi
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
      // bỏ qua nếu quota storage đầy
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
  const items = useSyncExternalStore(subscribeCart, getCartSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  // Các hàm điều khiển drawer giỏ hàng
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  // 3. Hàm thêm sản phẩm vào giỏ hàng
  const addItem = (
    product: Product,
    size: string,
    rentalDays: number = 4,
    quantity: number = 1,
    bookingDetails?: BookingDetails
  ) => {
    // Tính giá tiền cho gói ngày thuê:
    const baseAud = product.rentalPriceAud || Math.round((product.rentalPricePerDay * 4) / 16000);
    const baseVnd = product.rentalPricePerDay * rentalDays;

    // Gói 8 ngày có hệ số nhân 1.75, gói 1 ngày / 24h có hệ số 0.45
    const multiplier = rentalDays === 8 ? 1.75 : rentalDays === 1 ? 0.45 : 1;
    const rentalPriceAud = Math.round(baseAud * multiplier);
    const rentalPriceVnd = Math.round(baseVnd * multiplier);

    // Cộng phụ phí ngoài giờ và phí vận chuyển nếu có
    const extraAud = (bookingDetails?.deliveryFeeAud || 0) + (bookingDetails?.afterHoursFeeAud || 0);
    const extraVnd = (bookingDetails?.deliveryFeeVnd || 0) + (bookingDetails?.afterHoursFeeVnd || 0);

    const finalPriceAud = rentalPriceAud + extraAud;
    const finalPriceVnd = rentalPriceVnd + extraVnd;

    // Mã định danh duy nhất của mục trong giỏ
    const cartItemId = bookingDetails
      ? `${product.id}-${size}-${rentalDays}-${bookingDetails.startDate}-${bookingDetails.pickupTime}`
      : `${product.id}-${size}-${rentalDays}`;

    const currentItems = getCartSnapshot();
    const existingIndex = currentItems.findIndex((item) => item.id === cartItemId);

    let updated: CartItem[];
    if (existingIndex > -1) {
      // Nếu đã có trong giỏ -> tăng số lượng
      updated = currentItems.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // Nếu chưa có -> thêm mới
      const newItem: CartItem = {
        id: cartItemId,
        product,
        size,
        rentalDays,
        quantity,
        pricePerItemAud: finalPriceAud,
        pricePerItemVnd: finalPriceVnd,
        bookingDetails,
      };
      updated = [...currentItems, newItem];
    }
    saveCartItems(updated);

    // Tự động mở giỏ hàng trượt ra để khách thấy phản hồi ngay lập tức
    setIsOpen(true);
  };

  // 4. Xóa món đồ
  const removeItem = (itemId: string) => {
    const currentItems = getCartSnapshot();
    saveCartItems(currentItems.filter((item) => item.id !== itemId));
  };

  // 5. Cập nhật số lượng
  const updateQuantity = (itemId: string, delta: number) => {
    const currentItems = getCartSnapshot();
    const updated = currentItems
      .map((item) => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);
    saveCartItems(updated);
  };

  // 6. Xóa sạch giỏ hàng
  const clearCart = () => {
    saveCartItems([]);
  };

  // 7. Tính tổng số lượng và tổng tiền
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalAud = items.reduce(
    (sum, item) => sum + item.pricePerItemAud * item.quantity,
    0
  );
  const subtotalVnd = items.reduce(
    (sum, item) => sum + item.pricePerItemVnd * item.quantity,
    0
  );

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
        updateQuantity,
        clearCart,
        totalItems,
        subtotalAud,
        subtotalVnd,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/** Hook tiện ích để lấy dữ liệu giỏ hàng ở bất kỳ component nào */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart phải được sử dụng bên trong <CartProvider>");
  }
  return context;
}
