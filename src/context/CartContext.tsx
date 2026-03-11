import { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "UPDATE_QTY"; id: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "TOGGLE"; open?: boolean };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map((i) =>
            i.id === action.item.id ? { ...i, quantity: i.quantity + action.item.quantity } : i
          ),
        };
      }
      return { ...state, isOpen: true, items: [...state.items, action.item] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "UPDATE_QTY":
      if (action.quantity <= 0) return { ...state, items: state.items.filter((i) => i.id !== action.id) };
      return { ...state, items: state.items.map((i) => (i.id === action.id ? { ...i, quantity: action.quantity } : i)) };
    case "CLEAR":
      return { ...state, items: [] };
    case "TOGGLE":
      return { ...state, isOpen: action.open !== undefined ? action.open : !state.isOpen };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: "ADD_ITEM", item });
    trackEvent("add_to_cart", { item_id: item.id, item_name: item.name, price: item.price });
  }, []);

  const removeItem = useCallback((id: string) => dispatch({ type: "REMOVE_ITEM", id }), []);
  const updateQuantity = useCallback((id: string, quantity: number) => dispatch({ type: "UPDATE_QTY", id, quantity }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const toggleCart = useCallback((open?: boolean) => dispatch({ type: "TOGGLE", open }), []);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, isOpen: state.isOpen, itemCount, total, addItem, removeItem, updateQuantity, clearCart, toggleCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
