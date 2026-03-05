// src/features/admin/products/AddProduct.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import adminAPI from "../../../services/adminAPI";
import ImageUploader from "../../../components/Admin/ImageUploader";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { hasDeliveryPartnerAccess } from "../../../utils/roleUtils";

export default function AddProduct() {
  const { user } = useAuth();
  const isDeliveryPartner = hasDeliveryPartnerAccess(user);
  
  if (isDeliveryPartner) {
    return <Navigate to="/admin/orders" replace />;
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // 12 default specification parameters
  const defaultSpecs = [
    { key: "Product Type", value: "" },
    { key: "Color", value: "" },
    { key: "Fit", value: "" },
    { key: "Pattern", value: "" },
    { key: "Sleeve Length", value: "" },
    { key: "Neck/Collar", value: "" },
    { key: "Closure Type", value: "" },
    { key: "Fabric Type", value: "" },
    { key: "Occasion", value: "" },
    { key: "Care Instructions", value: "" },
    { key: "Season", value: "" },
    { key: "Country of Origin", value: "" }
  ];

  const [specs, setSpecs] = useState(defaultSpecs);

  const nav = useNavigate();

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (index) => setSpecs(specs.filter((_, i) => i !== index));
  const updateSpec = (index, field, val) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };

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
    // Optional dress style (not mandatory)
    fd.append("dressStyle", vals.dressStyle || "");
    fd.append("price", vals.price);
    fd.append("stock", vals.stock || 0);
    // sizes: optional comma-separated input (convert to array)
    const sizesArr = vals.sizes ? vals.sizes.split(',').map(s=>s.trim()).filter(Boolean) : []
    fd.append('sizes', JSON.stringify(sizesArr))
    
    // Collection flags
    fd.append("isNewArrival", vals.isNewArrival || false);
    fd.append("isBestSeller", vals.isBestSeller || false);
    fd.append("isFeatured", vals.isFeatured || false);

    // Key Features (each line = one bullet point)
    const keyFeaturesRaw = vals.keyFeatures || "";
    const keyFeaturesArr = keyFeaturesRaw.split("\n").map(l => l.replace(/^[\s•\-*]+/, '').trim()).filter(Boolean);
    fd.append("keyFeatures", JSON.stringify(keyFeaturesArr));

    // Dynamic Specifications
    const details = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        details[s.key.trim()] = s.value.trim();
      }
    });
    fd.append("details", JSON.stringify(details));

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
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register("description")}
          className="w-full border p-2 rounded"
          rows="4"
          placeholder="Enter product description"
        />
      </div>

      {/* Key Features Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Key Features <span className="text-gray-400 font-normal">(each line = one bullet point)</span>
        </label>
        <textarea
          {...register("keyFeatures")}
          className="w-full border p-2 rounded"
          rows="6"
          placeholder={"Premium textured fabric\nElegant tailored fit\nClassic black color\nClean back panel design\nDurable stitching and structured build\nSuitable for formal and semi-formal occasions"}
        />
        <p className="text-xs text-gray-400 mt-1">Write one feature per line. Each line will appear as a bullet point on the product page.</p>
      </div>

      {/* Product Specifications Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">
            Product Specifications
          </label>
          <button
            type="button"
            onClick={addSpec}
            className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline"
          >
            <span className="text-lg">+</span> Add More
          </button>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          {specs.map((spec, index) => (
            <div key={index} className={`flex items-center gap-2 px-4 py-2.5 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <input
                type="text"
                value={spec.key}
                onChange={(e) => updateSpec(index, "key", e.target.value)}
                placeholder="Label"
                className="w-[40%] bg-transparent border-none p-0 text-sm font-semibold text-gray-700 focus:ring-0 placeholder-gray-300"
              />
              <span className="text-gray-300">:</span>
              <input
                type="text"
                value={spec.value}
                onChange={(e) => updateSpec(index, "value", e.target.value)}
                placeholder="Enter value"
                className="flex-1 bg-transparent border-none p-0 text-sm text-gray-600 focus:ring-0 placeholder-gray-300"
              />
              <button
                type="button"
                onClick={() => removeSpec(index)}
                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
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
        <div>
          <label className="block text-sm font-medium text-gray-700">Dress Style (optional)</label>
          <input
            {...register("dressStyle")}
            className="w-full border p-2 rounded"
            placeholder="e.g., A-line, Maxi, Bodycon"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm">Sizes (optional, comma separated)</label>
        <input
          {...register("sizes")}
          className="w-full border p-2 rounded"
          placeholder="e.g., S,M,L or 6,7,8,9"
        />
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
