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
    
    // Collection flags
    fd.append("isNewArrival", vals.isNewArrival || false);
    fd.append("isBestSeller", vals.isBestSeller || false);
    fd.append("isFeatured", vals.isFeatured || false);

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
          <label className="block text-sm font-medium text-gray-700">Category *</label>
          <select
            {...register("category", { required: "Category is required" })}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Category</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Accessories">Accessories</option>
            <option value="Footwear">Footwear</option>
          </select>
          {errors.category && (
            <p className="text-red-600 text-sm">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sub Category</label>
          <select
            {...register("subcategory")}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Sub Category</option>
            {/* Men & Women Subcategories */}
            <option value="T-shirts">T-shirts</option>
            <option value="Shirts">Shirts</option>
            <option value="Jeans">Jeans</option>
            <option value="Jackets">Jackets</option>
            <option value="Shorts">Shorts</option>
            <option value="Hoodies">Hoodies</option>
            <option value="Dresses">Dresses</option>
            <option value="Kurtis">Kurtis</option>
            <option value="Casual Partywear">Casual Partywear</option>
            <option value="Suits">Suits</option>
            <option value="Tops">Tops</option>
            <option value="Outfits">Outfits</option>
            {/* Accessories Subcategories */}
            <option value="Bags">Bags</option>
            <option value="Watches">Watches</option>
            <option value="Belts">Belts</option>
            <option value="Sunglasses">Sunglasses</option>
            <option value="Wallets">Wallets</option>
            <option value="Caps">Caps</option>
            {/* Footwear Subcategories */}
            <option value="Sneakers">Sneakers</option>
            <option value="Boots">Boots</option>
            <option value="Formal">Formal Shoes</option>
            <option value="Sports">Sports Shoes</option>
            <option value="Casual">Casual Shoes</option>
            <option value="Sandals">Sandals</option>
          </select>
        </div>
      </div>

      {/* Collection Flags */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Collection Tags</label>
        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("isNewArrival")}
              className="rounded border-gray-300"
            />
            <span className="text-sm">New Arrival</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("isBestSeller")}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Best Seller</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("isFeatured")}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Featured</span>
          </label>
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
