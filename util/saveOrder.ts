import { db } from "@/lib/firebaseConfig"; // adjust path
import { CartItem } from "@/types";
import {
  collection,
  addDoc,
  Timestamp,
  runTransaction,
  getDoc,
  updateDoc,
  doc,
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
    name: string;
    email: string;
    address: string;
    phone: string;
  };
  paymentMethod: string;
  total: number;
}

async function saveOrder(
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
    // console.log("Order saved successfully");
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
    await runTransaction(db, async (transaction) => {
      for (const item of cart) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error("Product not found");
        }

        const productData = productSnap.data();
        const sizes = productData.sizes;

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

        // Deduct the quantity
        sizes[sizeIndex].stock -= item.qty;

        // Update the document
        transaction.update(productRef, { sizes });
      }

      await saveOrder(order, setLoading, setError);
      // Optionally create an 'orders' document here too
    });

    console.log("Order placed successfully!");
  } catch (error) {
    console.error("Order failed:", error);
  }
};
