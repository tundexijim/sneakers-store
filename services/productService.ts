import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { Product } from "../types";

export const PRODUCTS_PER_PAGE = 12;

function getSortParams(sortBy: string): [string, "asc" | "desc"] {
  switch (sortBy) {
    case "priceLowToHigh":
      return ["price", "asc"];
    case "priceHighToLow":
      return ["price", "desc"];
    case "name":
      return ["name", "asc"];
    default:
      return ["createdAt", "desc"];
  }
}

export async function getAllProducts(page = 1, sortBy = "newest") {
  try {
    const [sortField, direction] = getSortParams(sortBy);

    // For small offsets, fetch more items and slice (hybrid approach)
    const itemsToFetch = page * PRODUCTS_PER_PAGE;

    const q = query(
      collection(db, "products"),
      orderBy(sortField, direction),
      limit(itemsToFetch)
    );

    const snapshot = await getDocs(q);

    // Calculate start index for slicing
    const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
    const products = snapshot.docs
      .slice(startIndex, startIndex + PRODUCTS_PER_PAGE)
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate().toISOString() || null,
        };
      });

    // Get total count for pagination
    const countSnapshot = await getCountFromServer(collection(db, "products"));
    const total = countSnapshot.data().count;

    return {
      products,
      total,
      hasNextPage:
        snapshot.docs.length === itemsToFetch &&
        products.length === PRODUCTS_PER_PAGE,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

// Get single product with slug
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
