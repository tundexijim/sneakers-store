import { db } from "@/lib/firebaseConfig";
import { Category } from "@/types";
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
      } as Category;
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Error fetching categories");
  }
}
