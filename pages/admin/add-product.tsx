// pages/admin/add-product.tsx
import { useEffect, useState } from "react";
import Head from "next/head";
import { auth, db, storage } from "@/lib/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/router";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/authContext";

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    sizes: [] as number[],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sizeInput, setSizeInput] = useState("");
  const [error, setError] = useState("");
  const { user, loading, logOut } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.push("/admin/login"); // redirect to login/signup if not logged in
    }
  }, [user]);

  async function saveProduct(product: {
    name: string;
    price: string;
    description: string;
    image: string;
    sizes: number[];
  }) {
    const productRef = collection(db, "products");
    await addDoc(productRef, {
      ...product,
      createdAt: Timestamp.now(),
    });
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    const size = parseInt(sizeInput.trim(), 10);
    if (!isNaN(size) && !form.sizes.includes(size)) {
      setForm((prev) => ({ ...prev, sizes: [...prev.sizes, size] }));
      setSizeInput("");
    }
  };

  const removeSize = (size: number) => {
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
      await saveProduct(form);
      router.push("/");
    } catch (err) {
      setError("Failed to save product.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Head>
        <title>Add Product</title>
      </Head>
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Add New Product</h1>

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
            required
            className="w-full border px-4 py-2 rounded"
          />

          {/* Sizes */}
          <div className="space-y-2">
            <label className="font-medium">Sizes</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                className="border px-3 py-1 rounded w-full"
                placeholder="e.g. 42"
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
                    key={size}
                    className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {size}
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
        <button onClick={logOut}>Log Out</button>
      </main>
    </>
  );
}

// Placeholder - replace with real API or Firestore
