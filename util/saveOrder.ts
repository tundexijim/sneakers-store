import { db } from "@/lib/firebaseConfig"; // adjust path
import { CartItem } from "@/types";
import {
  collection,
  addDoc,
  Timestamp,
  runTransaction,
  doc,
  DocumentReference,
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

async function saveOrder<OrderType>(
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
) => {
  try {
    setLoading(true);

    await runTransaction(db, async (transaction) => {
      const productDataMap: {
        [productId: string]: { ref: DocumentReference; sizes: any[] };
      } = {};

      for (const item of cart) {
        const productRef = doc(db, "products", item.id);

        if (!productDataMap[item.id]) {
          const productSnap = await transaction.get(productRef);

          if (!productSnap.exists()) {
            throw new Error("Product not found");
          }

          productDataMap[item.id] = {
            ref: productRef,
            sizes: productSnap.data().sizes,
          };
        }
      }
      for (const item of cart) {
        const { sizes } = productDataMap[item.id];
        const sizeIndex = sizes.findIndex(
          (s: any) => s.size === item.selectedSize
        );

        if (sizeIndex === -1) {
          throw new Error(`Size ${item.selectedSize} not found`);
        }

        const availableStock = sizes[sizeIndex].stock;

        if (availableStock < item.qty) {
          throw new Error(
            `Not enough stock for size ${item.selectedSize}. Only ${availableStock} left.`
          );
        }
        sizes[sizeIndex].stock -= item.qty;
      }
      for (const { ref, sizes } of Object.values(productDataMap)) {
        transaction.update(ref, { sizes });
      }
    });
    await saveOrder(order, setLoading, setError);
    console.log("Order placed successfully!");
  } catch (error: any) {
    console.error("Order failed:", error.message);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
