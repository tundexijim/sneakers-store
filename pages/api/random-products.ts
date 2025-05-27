import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

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

    // const type = req.query.type;

    const snapshot = await getDocs(collection(db, "products"));
    const allProducts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Exclude product with the given ID if provided
    const filtered = allProducts.filter(
      (product) => !excludeIds.includes(product.id)
    );

    // Shuffle and limit to 4
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    res.status(200).json(selected);
  } catch (error) {
    console.error("Error in API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
