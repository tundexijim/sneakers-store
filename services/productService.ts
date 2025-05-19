import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { Product } from "../types";

export const PRODUCTS_PER_PAGE = 12;

export async function getAllProducts(page: number = 1) {
  const snapshot = await getDocs(collection(db, "products"));

  const allProducts = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() || null,
    };
  });

  const total = allProducts.length;

  const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
  const paginated = allProducts
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  return {
    products: paginated,
    total,
  };
}

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || null,
      } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
};
