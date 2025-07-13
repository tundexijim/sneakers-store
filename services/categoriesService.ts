import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// get all categories
export async function getAllCategories() {
  try {
    const snapshot = await getDocs(collection(db, "categories"));
    const categories = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // createdAt: data.createdAt?.toDate().toISOString() || null,
        // updatedAt: data.updatedAt?.toDate().toISOString() || null,
      };
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Error fetching categories");
  }
}
