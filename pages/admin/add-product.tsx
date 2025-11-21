// pages/admin/add-product.tsx
import { useEffect, useState } from "react";
import Head from "next/head";
import { storage } from "@/lib/firebaseConfig";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useRouter } from "next/router";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import { Product, ProductSize } from "@/types";
import { useIsClient } from "@/hooks/useIsClient";
import {
  getProductBySlug,
  saveProduct,
  updateProduct,
} from "@/services/productService";
import { GetServerSideProps } from "next";
import Image from "next/image";

export default function AddProductPage({ product }: { product?: Product }) {
  const [form, setForm] = useState({
    name: product ? product.name : "",
    price: product ? product.price : 0,
    oldPrice: product ? product.oldPrice : 0,
    description: product ? product.description : "",
    images: product ? (product.images as string[]) : ([] as string[]),
    sizes: product ? product.sizes : ([] as ProductSize[]),
    categorySlug: product ? product.categorySlug : "",
    isFeatured: product ? product.isFeatured : false,
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setloading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [sizeInput, setSizeInput] = useState({ size: "", stock: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user, loading: authloading, logOut } = useAuth();
  const router = useRouter();
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;
    if (!authloading && !user) {
      router.push("/admin/login");
    }
  }, [user, authloading]);

  const getPathFromUrl = (url: string) => {
    const decodedUrl = decodeURIComponent(url);
    const pathStart = decodedUrl.indexOf("/o/") + 3;
    const pathEnd = decodedUrl.indexOf("?alt=");
    return decodedUrl.substring(pathStart, pathEnd);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : undefined;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    if (error) setError("");
  };

  const handlesizeInputchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSizeInput({ ...sizeInput, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...newFiles]);
      if (error) setError("");
    }
  };

  const handleUpload = async () => {
    if (imageFiles.length === 0) return;

    setUploading(true);
    setError("");
    const uploadPromises: Promise<string>[] = [];

    imageFiles.forEach((file, index) => {
      const fileName = `${Date.now()}-${index}-${file.name}`;
      const storageRef = ref(storage, `products/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      const uploadPromise = new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress((prev) => ({
              ...prev,
              [fileName]: progress,
            }));
          },
          (err) => {
            reject(err);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });

      uploadPromises.push(uploadPromise);
    });

    try {
      const downloadURLs = await Promise.all(uploadPromises);
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...downloadURLs],
      }));
      setImageFiles([]);
      setUploadProgress({});
    } catch (err: any) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageUrl: string, index: number) => {
    try {
      // If it's an existing image from the database, we might want to delete it from storage
      const imagePath = getPathFromUrl(imageUrl);
      if (imagePath) {
        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
      }
    } catch (err) {
      console.log("Error deleting image from storage:", err);
      // Continue with removing from state even if storage deletion fails
    }

    // Remove from form state
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeFileFromQueue = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    const trimmedSize = sizeInput.size.trim();
    const size = /^\d+$/.test(trimmedSize)
      ? parseInt(trimmedSize, 10)
      : trimmedSize;
    const stock = parseInt(sizeInput.stock.trim(), 10);

    if (!isNaN(stock) && !form.sizes.some((s) => s.size === size)) {
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
    setError("");
    setSuccess("");
    setloading(true);

    if (!form.name) {
      setError("Please input product name.");
      setloading(false);
      return;
    }
    if (form.images.length === 0) {
      setError("Please upload at least one image before submitting.");
      setloading(false);
      return;
    }
    if (form.sizes.length === 0) {
      setError("Add at least one size.");
      setloading(false);
      return;
    }

    try {
      // Prepare form data with images array
      const formData = {
        ...form,
        price: Number(form.price),
        oldPrice: Number(form.oldPrice),
        image: form.images[0], // Keep backward compatibility by setting first image as main image
        images: form.images,
      };

      if (product) {
        // For updates, we'll handle the old image paths if needed
        await updateProduct(product, formData); // Pass first old image path for compatibility
        setSuccess("Product updated successfully!");
      } else {
        await saveProduct(formData);
        setSuccess("Product added successfully!");
        setForm({
          name: "",
          price: 0,
          oldPrice: 0,
          description: "",
          images: [],
          sizes: [],
          categorySlug: "",
          isFeatured: false,
        });
        setImageFiles([]);
      }
    } catch (err) {
      setError("Failed to save product.");
    } finally {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setloading(false);
    }
  };

  if (!isClient) return null;
  if (user?.email !== process.env.NEXT_PUBLIC_EMAIL) return null;
  if (authloading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Add Product - Admin Panel</title>
        <meta name="description" content="Add new product to inventory" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {product ? "Edit Product" : "Add New Product"}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {product
                    ? "Update product information"
                    : "Create a new product for your inventory"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href="/admin/AdminPanel"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  Admin Panel
                </Link>
                <button
                  onClick={logOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Product Information
              </h2>
              <p className="text-sm text-gray-600">
                Fill in the details for your product
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Success Message */}
              {success && (
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        {success}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter product name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₦</span>
                    </div>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      placeholder="0.00"
                      value={form.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Old Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₦</span>
                    </div>
                    <input
                      type="number"
                      id="oldPrice"
                      name="oldPrice"
                      placeholder="0.00"
                      value={form.oldPrice}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe your product..."
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.categorySlug}
                  name="categorySlug"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2  focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select a Category
                  </option>
                  <option value="sneakers">Sneakers</option>
                  <option value="jerseys">Jerseys</option>
                </select>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Sizes and Stock <span className="text-red-500">*</span>
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                      <input
                        name="size"
                        type="text"
                        value={sizeInput.size}
                        onChange={handlesizeInputchange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Size (e.g. 42)"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        name="stock"
                        type="number"
                        value={sizeInput.stock}
                        onChange={handlesizeInputchange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Stock (e.g. 10)"
                        min="0"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addSize}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium"
                    >
                      Add Size
                    </button>
                  </div>

                  {form.sizes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Added Sizes:
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {form.sizes.map((size) => (
                          <span
                            key={size.size}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            Size {size.size} - Stock: {size.stock}
                            <button
                              type="button"
                              onClick={() => removeSize(size)}
                              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800 focus:outline-none transition-colors"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Featured checkbox */}
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                />
                Featured
              </label>
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Product Images <span className="text-red-500">*</span>
                </label>

                {/* File Upload Area */}
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          {imageFiles.length > 0
                            ? `${imageFiles.length} files selected`
                            : "Choose image files"}
                        </span>
                        <input
                          id="file-upload"
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*"
                          multiple
                          className="sr-only"
                        />
                      </label>
                      <p className="mt-2 text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB each. Select multiple files.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Files in Upload Queue */}
                {imageFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Files ready to upload:
                    </h4>
                    <div className="space-y-2">
                      {imageFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm text-gray-600">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFileFromQueue(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && Object.keys(uploadProgress).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Upload Progress:
                    </h4>
                    {Object.entries(uploadProgress).map(
                      ([fileName, progress]) => (
                        <div key={fileName} className="space-y-1">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>
                              {fileName.split("-").slice(2).join("-")}
                            </span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Upload Button */}
                {imageFiles.length > 0 && !uploading && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleUpload}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Upload {imageFiles.length} Image
                      {imageFiles.length > 1 ? "s" : ""}
                    </button>
                  </div>
                )}

                {/* Image Preview Grid */}
                {form.images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Uploaded Images ({form.images.length}):
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {form.images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={imageUrl}
                            alt={`Product image ${index + 1}`}
                            width={160}
                            height={160}
                            className="w-full h-40 object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                          <div className="absolute top-2 right-2 opacity-50 transition-opacity">
                            <button
                              type="button"
                              onClick={() => removeImage(imageUrl, index)}
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white hover:bg-red-700 focus:outline-none transition-colors"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                Main
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={uploading || loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {uploading
                    ? "Uploading..."
                    : loading
                    ? "Loading..."
                    : product
                    ? "Update Product"
                    : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const slug = query.product as string;
  const product = await getProductBySlug(slug);
  return { props: { product } };
};
