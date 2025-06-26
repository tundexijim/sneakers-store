import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  addDoc,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
  documentId,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebaseConfig";
import { Product, ProductSize } from "../types";
import { deleteObject, ref } from "firebase/storage";
import { generateSlug } from "@/util/slugGenerator";

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
    const itemsToFetch = page * PRODUCTS_PER_PAGE;

    const q = query(
      collection(db, "products"),
      orderBy(sortField, direction),
      limit(itemsToFetch)
    );
    const snapshot = await getDocs(q);
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
    throw new Error("Error fetching products");
  }
}

// Get some products with ids

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Fetches multiple products from Firestore by their document IDs.
 * Handles batching automatically (Firestore allows max 30 IDs per query with documentId()).
 */
export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];

  // Remove duplicates and filter out empty strings
  const uniqueIds = [...new Set(ids.filter((id) => id && id.trim()))];

  if (!uniqueIds.length) return [];

  // Firestore allows up to 30 values in an 'in' query when using documentId()
  const chunks = chunkArray(uniqueIds, 30);
  const products: Product[] = [];

  try {
    for (const chunk of chunks) {
      const q = query(
        collection(db, "products"),
        where(documentId(), "in", chunk)
      );

      const snapshot = await getDocs(q);

      snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();

        // Validate that required fields exist
        if (data.name && data.price !== undefined && data.image && data.slug) {
          products.push({
            id: doc.id,
            name: data.name,
            price: data.price,
            image: data.image,
            slug: data.slug,
            randomValue: data.randomValue,
            sizes: data.sizes || [],
            description: data.description || "",
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          });
        } else {
          console.warn(`Product ${doc.id} is missing required fields:`, data);
        }
      });
    }

    return products;
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
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

//add product

export async function saveProduct(product: {
  name: string;
  price: number;
  description: string;
  image: string;
  sizes: ProductSize[];
}) {
  const slug = await generateSlug(product.name);
  const productRef = collection(db, "products");
  await addDoc(productRef, {
    ...product,
    slug,
    randomValue: Math.random(),
    createdAt: Timestamp.now(),
  });
}

//delete product
export async function deleteProduct(
  productId: string,
  imagePath: string
): Promise<void> {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
    console.log(`Product with ID ${productId} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete the product.");
  }
}

//update product

type UpdateProductData = {
  name: string;
  price?: number;
  description?: string;
  image?: string;
  sizes?: { size: number; stock: number }[];
  [key: string]: any; // Allow other dynamic fields
};

export async function updateProduct(
  productId: string,
  updatedData: UpdateProductData,
  imagePath?: string
) {
  try {
    if (imagePath) {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
    }
    const slug = await generateSlug(updatedData.name);
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { ...updatedData, slug: slug });
    console.log(`Product with ID ${productId} successfully updated.`);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}
