import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CartItem } from "../types";

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: number | string) => void;
  updateQty: (id: string, size: number | string, qty: number) => void;
  clearCart: () => void;
  total: number;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
};

export const CartContext = createContext<CartContextType>(
  {} as CartContextType
);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const exists = prev.find(
        (p) => p.id === item.id && p.selectedSize === item.selectedSize
      );
      if (exists) {
        return prev.map((p) =>
          p.id === item.id && p.selectedSize === item.selectedSize
            ? { ...p, qty: p.qty + item.qty }
            : p
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string, size: number | string) => {
    setCart((prev) =>
      prev.filter((item) => item.id !== id || item.selectedSize !== size)
    );
  };

  const updateQty = (id: string, size: number | string, qty: number) => {
    // if (qty < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.selectedSize === size ? { ...item, qty } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        total,
        setCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
