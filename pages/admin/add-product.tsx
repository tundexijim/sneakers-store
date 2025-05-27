// pages/admin/add-product.tsx
import { useEffect, useState } from "react";
import Head from "next/head";
import { db, storage } from "@/lib/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/router";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import { ProductSize } from "@/types";
import { generateSlug } from "@/util/slugGenerator";
import { useIsClient } from "@/hooks/useIsClient";

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    sizes: [] as ProductSize[],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sizeInput, setSizeInput] = useState({ size: "", stock: "" });
  const [error, setError] = useState("");
  const { user, loading, logOut } = useAuth();
  const router = useRouter();
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [user, loading]);

  async function saveProduct(
    product: {
      name: string;
      price: string;
      description: string;
      image: string;
      sizes: ProductSize[];
    },
    slug: string
  ) {
    const productRef = collection(db, "products");
    await addDoc(productRef, {
      ...product,
      slug,
      createdAt: Timestamp.now(),
    });
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlesizeInputchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSizeInput({ ...sizeInput, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return;

    const fileName = `${Date.now()}-${imageFile.name}`;
    const storageRef = ref(storage, `products/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    setUploading(true);
    setError("");

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (err) => {
        setError("Upload failed: " + err.message);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setForm((prev) => ({ ...prev, image: downloadURL }));
        setUploading(false);
      }
    );
  };

  const addSize = () => {
    const size = parseInt(sizeInput.size.trim(), 10);
    const stock = parseInt(sizeInput.stock.trim(), 10);

    if (
      !isNaN(size) &&
      !isNaN(stock) &&
      !form.sizes.some((s) => s.size === size)
    ) {
      setForm((prev) => ({
        ...prev,
        sizes: [...prev.sizes, { size, stock }],
      }));
      setSizeInput({ size: "", stock: "" });
    }
  };

  const removeSize = (size: ProductSize) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) {
      setError("Please upload an image before submitting.");
      return;
    }
    if (form.sizes.length === 0) {
      setError("Add at least one size.");
      return;
    }

    try {
      const slug = await generateSlug(form.name);
      await saveProduct(form, slug);
      window.alert("Product added successfully");
      setForm({
        name: "",
        price: "",
        description: "",
        image: "",
        sizes: [],
      });
    } catch (err) {
      setError("Failed to save product.");
    }
  };
  if (!isClient) return null;
  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Head>
        <title>Add Product</title>
      </Head>
      <main className="max-w-xl mx-auto p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
          <Link href="/admin/AdminPanel">
            <button>Panel</button>
          </Link>
          <button onClick={logOut}>Log Out</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          {/* Sizes */}
          <div className="space-y-2">
            <label className="font-medium">Sizes and Stock</label>
            <div className="flex gap-2">
              <input
                name="size"
                type="number"
                value={sizeInput.size}
                onChange={handlesizeInputchange}
                className="border px-3 py-1 rounded w-full"
                placeholder="e.g. 42"
              />
              <input
                name="stock"
                type="number"
                value={sizeInput.stock}
                onChange={handlesizeInputchange}
                className="border px-3 py-1 rounded w-full"
                placeholder="e.g. 2"
              />
              <button
                type="button"
                onClick={addSize}
                className="bg-gray-800 text-white px-3 py-1 rounded"
              >
                Add
              </button>
            </div>
            {form.sizes.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {form.sizes.map((size) => (
                  <span
                    key={size.size}
                    className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {size.size}, {size.stock}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="ml-2 text-red-500 font-bold"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <input type="file" onChange={handleFileChange} />
          {uploading ? (
            <p>Uploading: {uploadProgress.toFixed(0)}%</p>
          ) : (
            <button
              type="button"
              onClick={handleUpload}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Upload Image
            </button>
          )}

          {form.image && (
            <div className="mt-2">
              <img
                src={form.image}
                alt="Preview"
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          )}

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          >
            Save Product
          </button>
        </form>
      </main>
    </>
  );
}

// Placeholder - replace with real API or Firestore
