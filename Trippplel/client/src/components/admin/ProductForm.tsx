"use client";
import { useState, useEffect } from "react";
import { Color } from "@/types";
import { uploadImage } from "@/lib/adminApi";
import toast from "react-hot-toast";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface Props {
  initialData?: {
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    category?: "tshirt" | "hoodie";
    sizes?: string[];
    colors?: Color[];
    stock?: number;
    images?: string[];
    isFeatured?: boolean;
    isNew?: boolean;
  };
  onSubmit: (data: object) => Promise<void>;
  loading: boolean;
}

export default function ProductForm({ initialData, onSubmit, loading }: Props) {
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugLocked, setSlugLocked] = useState(!!initialData?.slug);
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState<number | "">(initialData?.price ?? "");
  const [category, setCategory] = useState<"tshirt" | "hoodie">(
    initialData?.category || "tshirt"
  );
  const [sizes, setSizes] = useState<string[]>(initialData?.sizes || []);
  const [colors, setColors] = useState<Color[]>(initialData?.colors || []);
  const [stock, setStock] = useState<number | "">(initialData?.stock ?? "");
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isNew, setIsNew] = useState(initialData?.isNew || false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!slugLocked) setSlug(slugify(name));
  }, [name, slugLocked]);

  const toggleSize = (size: string) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const addColor = () =>
    setColors((prev) => [...prev, { name: "", hex: "#000000" }]);

  const updateColor = (i: number, key: "name" | "hex", val: string) => {
    setColors((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, [key]: val } : c))
    );
  };

  const removeColor = (i: number) =>
    setColors((prev) => prev.filter((_, idx) => idx !== i));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      setImages((prev) => [...prev, res.data.url]);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (i: number) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      slug,
      description,
      price: Number(price),
      category,
      sizes,
      colors,
      stock: Number(stock),
      images,
      isFeatured,
      isNew,
    });
  };

  const inputClass =
    "w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:border-[#CCFF00] focus:outline-none";
  const labelClass = "block text-xs text-zinc-400 uppercase tracking-wider mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Name + Slug */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Slug
            <button
              type="button"
              onClick={() => setSlugLocked((l) => !l)}
              className="ml-2 text-[#CCFF00] text-xs"
              title={slugLocked ? "Unlock to auto-generate" : "Lock to edit manually"}
            >
              {slugLocked ? "🔒" : "🔓"}
            </button>
          </label>
          <input
            value={slug}
            onChange={(e) => {
              setSlugLocked(true);
              setSlug(e.target.value);
            }}
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Price + Stock + Category */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Price (KES)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
            required
            min="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
            required
            min="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as "tshirt" | "hoodie")}
            className={inputClass}
          >
            <option value="tshirt">T-Shirt</option>
            <option value="hoodie">Hoodie</option>
          </select>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <label className={labelClass}>Sizes</label>
        <div className="flex gap-2 flex-wrap">
          {SIZES.map((size) => (
            <button
              type="button"
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3 py-1 text-xs font-bold border transition-colors ${
                sizes.includes(size)
                  ? "bg-[#CCFF00] text-black border-[#CCFF00]"
                  : "border-zinc-600 text-zinc-400 hover:border-zinc-400"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Colors</label>
          <button
            type="button"
            onClick={addColor}
            className="text-xs text-[#CCFF00] uppercase tracking-wider font-bold hover:text-white transition-colors"
          >
            + Add Color
          </button>
        </div>
        {colors.length === 0 && (
          <p className="text-zinc-600 text-xs">No colors added yet</p>
        )}
        <div className="space-y-2">
          {colors.map((color, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="color"
                value={color.hex}
                onChange={(e) => updateColor(i, "hex", e.target.value)}
                className="w-10 h-9 bg-zinc-900 border border-zinc-700 cursor-pointer p-0.5"
              />
              <input
                placeholder="Color name (e.g. Black)"
                value={color.name}
                onChange={(e) => updateColor(i, "name", e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:border-[#CCFF00] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeColor(i)}
                className="text-red-400 hover:text-red-300 text-xs font-bold px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className={labelClass}>Images</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((url, i) => (
            <div key={i} className="relative w-20 h-20 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover border border-zinc-700"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center font-bold hover:bg-red-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <label
          className={`inline-flex items-center gap-2 px-4 py-2 border border-zinc-600 text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-[#CCFF00] transition-colors ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {uploading ? "Uploading..." : "+ Upload Image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Flags */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="accent-[#CCFF00] w-4 h-4"
          />
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">
            Featured
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isNew}
            onChange={(e) => setIsNew(e.target.checked)}
            className="accent-[#CCFF00] w-4 h-4"
          />
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">
            New Arrival
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#CCFF00] text-black font-black text-sm uppercase tracking-widest px-8 py-3 hover:bg-white transition-colors disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Product"}
      </button>
    </form>
  );
}
