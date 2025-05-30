import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAt,
  getCountFromServer,
} from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const excludeIds = req.query.excludeIds
      ? Array.isArray(req.query.excludeIds)
        ? req.query.excludeIds
        : [req.query.excludeIds]
      : [];

    const randomProducts = await getRandomProducts(4, excludeIds);

    res.status(200).json(randomProducts);
  } catch (error) {
    console.error("Error in API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Method 1: Using random field (RECOMMENDED - requires adding randomValue field to products)
async function getRandomProductsWithField(
  count: number,
  excludeIds: string[] = []
) {
  const products: any[] = [];
  const maxAttempts = count * 3; // Prevent infinite loops
  let attempts = 0;

  while (products.length < count && attempts < maxAttempts) {
    const randomValue = Math.random();

    // Query for products with randomValue >= our random number
    let q = query(
      collection(db, "products"),
      where("randomValue", ">=", randomValue),
      orderBy("randomValue"),
      limit(count - products.length + 2) // Get a few extra in case some are excluded
    );

    let snapshot = await getDocs(q);

    // If we don't get enough, try the opposite direction
    if (snapshot.empty || snapshot.docs.length < count - products.length) {
      q = query(
        collection(db, "products"),
        where("randomValue", "<=", randomValue),
        orderBy("randomValue", "desc"),
        limit(count - products.length + 2)
      );
      snapshot = await getDocs(q);
    }

    const newProducts = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(
        (product) =>
          !excludeIds.includes(product.id) &&
          !products.some((p) => p.id === product.id)
      );

    products.push(...newProducts);
    attempts++;
  }

  return products.slice(0, count);
}

// Method 2: Using cursor-based random sampling (works with existing data)
async function getRandomProductsWithCursor(
  count: number,
  excludeIds: string[] = []
) {
  try {
    // Get total count first
    const countSnapshot = await getCountFromServer(collection(db, "products"));
    const totalCount = countSnapshot.data().count;

    if (totalCount === 0) return [];

    const products: any[] = [];
    const usedIndices = new Set<number>();
    const maxAttempts = count * 5;
    let attempts = 0;

    while (
      products.length < count &&
      attempts < maxAttempts &&
      usedIndices.size < totalCount
    ) {
      // Generate random index
      const randomIndex = Math.floor(Math.random() * totalCount);

      if (usedIndices.has(randomIndex)) {
        attempts++;
        continue;
      }

      usedIndices.add(randomIndex);

      // Get product at random index using cursor
      const q = query(
        collection(db, "products"),
        orderBy("createdAt"), // Use a consistent field for ordering
        startAt(randomIndex),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const product = {
          id: doc.id,
          ...doc.data(),
        };

        if (!excludeIds.includes(product.id)) {
          products.push(product);
        }
      }

      attempts++;
    }

    return products;
  } catch (error) {
    console.error("Error in cursor-based random sampling:", error);
    // Fallback to simple method if cursor approach fails
    return getRandomProductsSimple(count, excludeIds);
  }
}

// Method 3: Simple random sampling with smaller batches (fallback)
async function getRandomProductsSimple(
  count: number,
  excludeIds: string[] = []
) {
  const batchSize = Math.max(count * 2, 20); // Get more than needed

  const q = query(collection(db, "products"), limit(batchSize));

  const snapshot = await getDocs(q);
  const allProducts = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const filtered = allProducts.filter(
    (product) => !excludeIds.includes(product.id)
  );
  const shuffled = filtered.sort(() => 0.5 - Math.random());

  return shuffled.slice(0, count);
}

// Main function that tries the best available method
async function getRandomProducts(count: number, excludeIds: string[] = []) {
  // Try the random field method first (most efficient)
  try {
    const products = await getRandomProductsWithField(count, excludeIds);
    if (products.length >= count) {
      return products;
    }
  } catch (error) {
    console.log("Random field method failed, trying cursor method");
  }

  // Fallback to cursor-based method
  try {
    const products = await getRandomProductsWithCursor(count, excludeIds);
    if (products.length > 0) {
      return products;
    }
  } catch (error) {
    console.log("Cursor method failed, using simple method");
  }

  // Final fallback to simple method
  return getRandomProductsSimple(count, excludeIds);
}
