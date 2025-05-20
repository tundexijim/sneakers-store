import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

// Check if slug already exists in Firestore
async function isSlugTaken(slug: string): Promise<boolean> {
  const q = query(collection(db, "products"), where("slug", "==", slug));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function generateSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  let slug = baseSlug;
  let count = 1;

  while (await isSlugTaken(slug)) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}
