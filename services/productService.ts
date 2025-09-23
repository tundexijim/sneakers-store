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

// Get Products for sitemap

export async function getAllProductsForSitemap() {
  const snapshot = await getDocs(collection(db, "products"));

  const products = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      slug: data.slug, // assuming you store slug for product pages
      updatedAt:
        data.createdAt?.toDate().toISOString() || new Date().toISOString(),
    };
  });
  return { products };
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
            isFeatured: data.isFeatured,
            sizes: data.sizes || [],
            description: data.description || "",
            categorySlug: data.categorySlug,
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

// get products by category
export async function getProductsByCategory(
  categoryName: string,
  page = 1,
  sortBy = "newest"
) {
  try {
    const [sortField, direction] = getSortParams(sortBy);
    const itemsToFetch = page * PRODUCTS_PER_PAGE;

    const q = query(
      collection(db, "products"),
      where("categorySlug", "==", categoryName),
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

    const countQuery = query(
      collection(db, "products"),
      where("categorySlug", "==", categoryName)
    );
    const countSnapshot = await getCountFromServer(countQuery);
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
    console.error("Error fetching products by category:", error);
    throw new Error("Error fetching products by category");
  }
}
// Get Products with related category

export async function getProductsRelatedCategory(
  limitCount: number = 10,
  categoryName: string,
  excludeProductId?: string
): Promise<Product[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("categorySlug", "==", categoryName),
      orderBy("createdAt", "desc"),
      limit(limitCount + 1) // Get one extra in case we need to exclude current product
    );

    const querySnapshot = await getDocs(q);

    const Products: Product[] = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Product)
    );

    // Filter out the current product if excludeProductId is provided
    let RelatedProducts = Products;
    if (excludeProductId) {
      RelatedProducts = Products.filter(
        (product) => product.id !== excludeProductId
      );
    }

    // Return only the requested number of products
    return RelatedProducts.slice(0, limitCount);
  } catch (error) {
    console.error("Error fetching related products:", error);
    throw new Error("Failed to fetch related products");
  }
}
//add product

export async function saveProduct(product: {
  name: string;
  price: number;
  description: string;
  image: string;
  sizes: ProductSize[];
  categorySlug: string;
}) {
  const slug = await generateSlug(product.name);
  const productRef = collection(db, "products");
  await addDoc(productRef, {
    ...product,
    slug,
    createdAt: Timestamp.now(),
  });
}

//delete product
export async function deleteProduct(
  productId: string,
  imagePaths: string[]
): Promise<void> {
  try {
    // Delete all images with individual error handling
    const deleteResults = await Promise.allSettled(
      imagePaths.map(async (imagePath) => {
        const imageRef = ref(storage, imagePath);
        return deleteObject(imageRef);
      })
    );

    // Log any failed image deletions
    deleteResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.warn(
          `Failed to delete image ${imagePaths[index]}:`,
          result.reason
        );
      }
    });

    // Delete the product document
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);

    const successfulDeletes = deleteResults.filter(
      (r) => r.status === "fulfilled"
    ).length;
    console.log(
      `Product with ID ${productId} deleted successfully. ${successfulDeletes}/${imagePaths.length} images deleted.`
    );
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
  categorySlug?: string;
  sizes?: { size: number | string; stock: number }[];
  [key: string]: any; // Allow other dynamic fields
};

export async function updateProduct(
  product: Product,
  updatedData: UpdateProductData
) {
  try {
    const slug = await generateSlug(updatedData.name);
    const productRef = doc(db, "products", product.id);
    if (product.name === updatedData.name) {
      await updateDoc(productRef, updatedData);
    } else {
      await updateDoc(productRef, { ...updatedData, slug: slug });
    }
    console.log(`Product with ID ${product.id} successfully updated.`);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

// Featured products
export async function getFeaturedProducts(
  limitCount: number
): Promise<Product[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("isFeatured", "==", true),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    const featuredProducts: Product[] = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Product)
    );

    return featuredProducts;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    throw new Error("Failed to fetch featured products");
  }
}
