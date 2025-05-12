import { db } from "@/lib/firebaseConfig"; // adjust path
import { collection, addDoc, Timestamp } from "firebase/firestore";

interface OrderData {
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
    // console.log("Order saved successfully");
  } catch (error: any) {
    console.error("Failed to save order:", error);
    setError("Failed to save order. Please try again.");
    setLoading(false);
  } finally {
    setLoading(false);
  }
}
