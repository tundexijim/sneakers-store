import { db } from "@/lib/firebaseConfig"; // adjust path
import { CartItem } from "@/types";
import {
  collection,
  addDoc,
  Timestamp,
  runTransaction,
  doc,
  DocumentReference,
  getDoc,
} from "firebase/firestore";

export interface OrderData {
  orderNumber: string;
  items: {
    productId: string;
    name: string;
    qty: number;
    price: number;
    selectedSize: number;
  }[];
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    address: string;
    phone: string;
    selectedState: string;
  };
  paymentMethod: string;
  total: number;
  ShippingCost: number;
  Subtotal: number;
}

export async function saveOrder(
  order: OrderData,
  setLoading: (state: boolean) => void,
  setError: (msg: string) => void
) {
  try {
    setLoading(true);

    const orderRef = collection(db, "orders");
    await addDoc(orderRef, {
      ...order,
      createdAt: Timestamp.now(),
    });
    setLoading(false);
  } catch (error: any) {
    console.error("Failed to save order:", error);
    setError("Failed to save order. Please try again.");
    setLoading(false);
  } finally {
    setLoading(false);
  }
}

export const placeOrder = async (
  cart: CartItem[],
  order: OrderData,
  setLoading: (state: boolean) => void,
  setError: (msg: string) => void
): Promise<boolean> => {
  try {
    setLoading(true);
    setError("");
    const productDataMap: {
      [productId: string]: { ref: DocumentReference; sizes: any[] };
    } = {};
    for (const item of cart) {
      const productRef = doc(db, "products", item.id);

      if (!productDataMap[item.id]) {
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
          setError(`Product ${item.id} not found`);
          return false;
        }
        productDataMap[item.id] = {
          ref: productRef,
          sizes: productSnap.data().sizes,
        };
      }
      const { sizes } = productDataMap[item.id];
      const sizeIndex = sizes.findIndex(
        (s: any) => s.size === item.selectedSize
      );
      if (sizeIndex === -1) {
        setError(`Size ${item.selectedSize} not found for product ${item.id}`);
        return false;
      }
      const availableStock = sizes[sizeIndex].stock;
      if (availableStock < item.qty) {
        setError(
          `Not enough stock for ${item.name}(${item.selectedSize}). Only ${availableStock} available, but ${item.qty} requested. Please adjust in cart`
        );
        return false;
      }
    }
    await runTransaction(db, async (transaction) => {
      for (const item of cart) {
        const { ref, sizes } = productDataMap[item.id];
        const sizeIndex = sizes.findIndex(
          (s: any) => s.size === item.selectedSize
        );
        sizes[sizeIndex].stock -= item.qty;
        transaction.update(ref, { sizes });
      }
    });
    await saveOrder(order, setLoading, setError);
    console.log("Order placed successfully!");
    return true;
  } catch (error: any) {
    console.error("Order failed:", error);
    const errorMessage =
      error?.message || "An unexpected error occurred while placing the order";
    setError(errorMessage);
    return false;
  } finally {
    setLoading(false);
  }
};

export const validateStockAvailability = async (
  cart: CartItem[]
): Promise<void> => {
  const productChecks = cart.map(async (item) => {
    const productRef = doc(db, "products", item.id);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      throw new Error(`Product ${item.id} not found`);
    }

    const sizes = productSnap.data().sizes;
    const sizeIndex = sizes.findIndex((s: any) => s.size === item.selectedSize);

    if (sizeIndex === -1) {
      throw new Error(
        `Size ${item.selectedSize} not found for product ${item.id}`
      );
    }

    const availableStock = sizes[sizeIndex].stock;

    if (availableStock < item.qty) {
      throw new Error(
        `Not enough stock for ${item.name}(size: ${item.selectedSize}). Only ${availableStock} item(s) is available, but you requested for ${item.qty} item(s). Please adjust in cart.`
      );
    }
  });

  await Promise.all(productChecks);
};
