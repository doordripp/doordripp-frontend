// src/features/admin/products/AddProduct.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import adminAPI from "../../../services/adminAPI";
import ImageUploader from "../../../components/Admin/ImageUploader";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();

  const onSubmit = async (vals) => {
    if (loading) return;

    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    const fd = new FormData();
    fd.append("name", vals.name);
    fd.append("description", vals.description || "");
    fd.append("category", vals.category || "");
    fd.append("subcategory", vals.subcategory || "");
    fd.append("price", vals.price);
    fd.append("stock", vals.stock || 0);

    images.forEach((file) => fd.append("images", file));

    try {
      setLoading(true);
      await adminAPI.createProduct(fd);

      // Optional: toast.success("Product created")
      reset();
      setImages([]);
      nav("/admin/products");

    } catch (err) {
      console.error(err);
      alert("Create failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-4 rounded shadow max-w-lg space-y-4"
    >
      <div>
        <label className="block text-sm">Name</label>
        <input
          {...register("name", { required: "Name is required" })}
          className="w-full border p-2 rounded"
        />
        {errors.name && (
          <p className="text-red-600 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm">Description</label>
        <textarea
          {...register("description")}
          className="w-full border p-2 rounded"
          rows="4"
          placeholder="Enter product description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm">Category</label>
          <select
            {...register("category")}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Category</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
            <option value="Shoes">Shoes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm">Sub Category</label>
          <select
            {...register("subcategory")}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Sub Category</option>
            <option value="T-Shirt">T-Shirt</option>
            <option value="Pants">Pants</option>
            <option value="Suits">Suits</option>
            <option value="Shirt">Shirt</option>
            <option value="Jacket">Jacket</option>
            <option value="Cap">Cap</option>
            <option value="Belt">Belt</option>
            <option value="Watch">Watch</option>
            <option value="Sneakers">Sneakers</option>
            <option value="Boots">Boots</option>
            <option value="Formal Shoes">Formal Shoes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm">Price</label>
          <input
            type="number"
            {...register("price", { required: "Price is required" })}
            className="w-full border p-2 rounded"
          />
          {errors.price && (
            <p className="text-red-600 text-sm">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm">Stock</label>
          <input
            type="number"
            {...register("stock")}
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm">Images</label>
        <ImageUploader onChange={setImages} />
        {images.length === 0 && (
          <p className="text-gray-500 text-sm">Upload at least 1 image.</p>
        )}
      </div>

      <button
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
        }`}
      >
        {loading ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}
