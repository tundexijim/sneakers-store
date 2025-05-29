import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { Product } from "../types";

export const PRODUCTS_PER_PAGE = 12;

export async function getAllProducts(
  page: number = 1,
  sortBy: string = "newest"
): Promise<{ products: Product[]; total: number }> {
  try {
    const snapshot = await getDocs(collection(db, "products"));

    const allProducts: Product[] = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt && data.createdAt.toDate
            ? (data.createdAt as Timestamp).toDate().toISOString()
            : data.createdAt || null,
      } as Product;
    });

    const total = allProducts.length;

    const sortedProducts = [...allProducts].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "priceLowToHigh") {
        return a.price - b.price;
      } else if (sortBy === "priceHighToLow") {
        return b.price - a.price;
      } else {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(a.createdAt) < new Date(b.createdAt) ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
    const paginated = sortedProducts.slice(
      startIndex,
      startIndex + PRODUCTS_PER_PAGE
    );

    return {
      products: paginated,
      total,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

export const getProductBySlug = async (
  slug: string
): Promise<Product | null> => {
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
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
    console.error("Error fetching product by slug:", error);
    return null;
  }
};
