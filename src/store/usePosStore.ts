import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OrderType } from '@prisma/client';

export interface CartAddon {
  addonId: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  itemId: string;
  name: string;
  shortCode?: string;
  foodType: 'VEG' | 'NON_VEG' | 'EGG' | 'BEVERAGE' | 'OTHER';
  unitPrice: number;
  quantity: number;
  variantId?: string | null;
  variantName?: string | null;
  addons?: CartAddon[];
  notes?: string;
  lineTotal: number;
}

export interface AttachedCustomer {
  id?: string;
  name: string;
  phone: string;
  points: number;
  walletBalance: number;
  tier: string;
  visits: number;
}

interface PosState {
  orderType: OrderType;
  selectedTableNumber: string;
  selectedTableId: string | null;
  cart: CartItem[];
  customer: AttachedCustomer | null;

  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  discountReason: string;

  serviceCharge: number;
  packagingCharge: number;
  deliveryCharge: number;
  gstRate: number; // e.g. 5.0

  // Actions
  setOrderType: (type: OrderType) => void;
  setTable: (tableNumber: string, tableId?: string | null) => void;
  setCustomer: (customer: AttachedCustomer | null) => void;
  addItem: (item: any, variant?: any, addons?: CartAddon[]) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  setItemNotes: (cartItemId: string, notes: string) => void;
  setDiscount: (type: 'PERCENT' | 'FLAT', value: number, reason?: string) => void;
  setCharges: (service: number, packaging: number, delivery: number) => void;
  clearCart: () => void;
  loadOrder: (order: any) => void;

  // Computed Totals
  getTotals: () => {
    subtotal: number;
    discountAmount: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    totalTax: number;
    serviceCharge: number;
    packagingCharge: number;
    deliveryCharge: number;
    totalCharges: number;
    rawTotal: number;
    roundOff: number;
    grandTotal: number;
    totalItems: number;
  };
}

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      orderType: 'DINE_IN',
      selectedTableNumber: 'T-01',
      selectedTableId: null,
      cart: [],
      customer: null,

      discountType: 'PERCENT',
      discountValue: 0,
      discountReason: '',

      serviceCharge: 0,
      packagingCharge: 0,
      deliveryCharge: 0,
      gstRate: 5.0,

      setOrderType: (type) => {
        set({
          orderType: type,
          // Auto adjust packaging charge if takeaway or delivery
          packagingCharge: type === 'TAKEAWAY' || type === 'DELIVERY' ? 25 : 0,
          deliveryCharge: type === 'DELIVERY' ? 40 : 0,
        });
      },

      setTable: (tableNumber, tableId = null) => {
        set({ selectedTableNumber: tableNumber, selectedTableId: tableId });
      },

      setCustomer: (customer) => set({ customer }),

      addItem: (item, variant, addons = []) => {
        const cart = get().cart;
        const variantPrice = variant ? variant.price : item.basePrice;
        const addonsPrice = addons.reduce((sum, a) => sum + a.price, 0);
        const unitPrice = variantPrice + addonsPrice;

        // Generate a composite key for item + variant + addons
        const addonKey = addons.map((a) => a.addonId).sort().join('-');
        const cartItemId = `${item.id}-${variant?.id || 'base'}-${addonKey}`;

        const existingIndex = cart.findIndex((c) => c.cartItemId === cartItemId);

        if (existingIndex !== -1) {
          const updated = [...cart];
          updated[existingIndex].quantity += 1;
          updated[existingIndex].lineTotal = updated[existingIndex].quantity * unitPrice;
          set({ cart: updated });
        } else {
          const newItem: CartItem = {
            cartItemId,
            itemId: item.id,
            name: item.name,
            shortCode: item.shortCode,
            foodType: item.foodType,
            unitPrice,
            quantity: 1,
            variantId: variant?.id,
            variantName: variant?.name,
            addons,
            lineTotal: unitPrice,
          };
          set({ cart: [...cart, newItem] });
        }
      },

      updateQuantity: (cartItemId, delta) => {
        const cart = get().cart;
        const updated = cart
          .map((item) => {
            if (item.cartItemId === cartItemId) {
              const newQty = item.quantity + delta;
              if (newQty <= 0) return null;
              return {
                ...item,
                quantity: newQty,
                lineTotal: newQty * item.unitPrice,
              };
            }
            return item;
          })
          .filter(Boolean) as CartItem[];

        set({ cart: updated });
      },

      removeItem: (cartItemId) => {
        set({ cart: get().cart.filter((c) => c.cartItemId !== cartItemId) });
      },

      setItemNotes: (cartItemId, notes) => {
        set({
          cart: get().cart.map((item) =>
            item.cartItemId === cartItemId ? { ...item, notes } : item
          ),
        });
      },

      setDiscount: (type, value, reason = '') => {
        set({ discountType: type, discountValue: value, discountReason: reason });
      },

      setCharges: (service, packaging, delivery) => {
        set({
          serviceCharge: service,
          packagingCharge: packaging,
          deliveryCharge: delivery,
        });
      },

      clearCart: () => {
        set({
          cart: [],
          customer: null,
          discountValue: 0,
          discountReason: '',
          serviceCharge: 0,
          packagingCharge: get().orderType === 'TAKEAWAY' || get().orderType === 'DELIVERY' ? 25 : 0,
          deliveryCharge: get().orderType === 'DELIVERY' ? 40 : 0,
        });
      },

      loadOrder: (order) => {
        const cartItems: CartItem[] = (order.items || []).map((i: any, idx: number) => ({
          cartItemId: `${i.itemId || i.id}-${idx}`,
          itemId: i.itemId || i.id,
          name: i.name,
          foodType: i.foodType || 'VEG',
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          lineTotal: i.totalPrice || i.unitPrice * i.quantity,
        }));

        set({
          cart: cartItems,
          orderType: order.orderType,
          selectedTableNumber: order.tableNumber || 'T-01',
          discountValue: order.discountAmount || 0,
          discountType: 'FLAT',
        });
      },

      getTotals: () => {
        const state = get();
        const subtotal = state.cart.reduce((sum, item) => sum + item.lineTotal, 0);

        let discountAmount = 0;
        if (state.discountType === 'PERCENT' && state.discountValue > 0) {
          discountAmount = (subtotal * state.discountValue) / 100;
        } else if (state.discountType === 'FLAT') {
          discountAmount = Math.min(subtotal, state.discountValue);
        }

        const taxableAmount = Math.max(0, subtotal - discountAmount);

        // Standard Indian GST (5% = 2.5% CGST + 2.5% SGST)
        const halfRate = state.gstRate / 2;
        const cgstAmount = Number(((taxableAmount * halfRate) / 100).toFixed(2));
        const sgstAmount = Number(((taxableAmount * halfRate) / 100).toFixed(2));
        const totalTax = cgstAmount + sgstAmount;

        const totalCharges = state.serviceCharge + state.packagingCharge + state.deliveryCharge;
        const rawTotal = taxableAmount + totalTax + totalCharges;
        const grandTotal = Math.round(rawTotal);
        const roundOff = Number((grandTotal - rawTotal).toFixed(2));
        const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);

        return {
          subtotal,
          discountAmount,
          taxableAmount,
          cgstAmount,
          sgstAmount,
          totalTax,
          serviceCharge: state.serviceCharge,
          packagingCharge: state.packagingCharge,
          deliveryCharge: state.deliveryCharge,
          totalCharges,
          rawTotal,
          roundOff,
          grandTotal,
          totalItems,
        };
      },
    }),
    {
      name: 'restodesk-pos-active-cart',
      partialize: (state) => ({
        orderType: state.orderType,
        selectedTableNumber: state.selectedTableNumber,
        cart: state.cart,
        customer: state.customer,
      }),
    }
  )
);
