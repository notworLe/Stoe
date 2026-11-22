"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Upload, Search } from "lucide-react";
import { type Product, type Size } from "@/types";
import {
  adminCreateGarment,
  adminDeleteGarment,
  adminUpdateGarment,
  uploadAdminMedia,
  type GarmentSaveInput,
} from "@/lib/api";
import { formatAudShort } from "@/lib/constants";

interface AdminGarmentsTabProps {
  token: string;
  garments: Product[];
  onRefresh: () => Promise<void>;
}

const DEFAULT_SIZES: Size[] = [
  { label: "XS", bust: 80, waist: 62, hip: 88, length: 138, available: true },
  { label: "S", bust: 84, waist: 66, hip: 92, length: 140, available: true },
  { label: "M", bust: 88, waist: 70, hip: 96, length: 142, available: true },
  { label: "L", bust: 92, waist: 74, hip: 100, length: 144, available: true },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminGarmentsTab({
  token,
  garments,
  onRefresh,
}: AdminGarmentsTabProps) {
  const [search, setSearch] = useState("");
  const [editingGarment, setEditingGarment] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState<GarmentSaveInput>({
    code: "",
    slug: "",
    name: "",
    description: "",
    rentalPriceAud: 130,
    occasion: "Wedding",
    color: "Ivory",
    images: ["/images/aodai-ivory.jpg"],
    sizes: DEFAULT_SIZES,
    modelHeight: "168 cm",
    modelWearingSize: "Size S",
    isActive: true,
  });

  const openCreateModal = () => {
    setEditingGarment(null);
    setForm({
      code: `AD-${garments.length + 25}`,
      slug: "",
      name: "",
      description: "",
      rentalPriceAud: 130,
      occasion: "Wedding",
      color: "Ivory",
      images: ["/images/aodai-ivory.jpg"],
      sizes: DEFAULT_SIZES.map((s) => ({ ...s })),
      modelHeight: "168 cm",
      modelWearingSize: "Size S",
      isActive: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (garment: Product) => {
    setEditingGarment(garment);
    setForm({
      code: garment.code,
      slug: garment.slug,
      name: garment.name,
      description: garment.description,
      rentalPriceAud: garment.rentalPriceAud,
      occasion: garment.occasion,
      color: garment.color,
      images: garment.images.length > 0 ? [...garment.images] : ["/images/aodai-ivory.jpg"],
      sizes: garment.sizes.map((s) => ({ ...s })),
      modelHeight: garment.modelInfo?.height || "",
      modelWearingSize: garment.modelInfo?.wearingSize || "",
      isActive: garment.isActive !== false,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload: GarmentSaveInput = {
        ...form,
        slug: form.slug.trim() || slugify(form.name),
        images: form.images.map((img) => img.trim()).filter(Boolean),
      };
      if (editingGarment) {
        await adminUpdateGarment(token, editingGarment.id, payload);
        setNotice(`Updated garment ${payload.code} (${payload.name}).`);
      } else {
        await adminCreateGarment(token, payload);
        setNotice(`Created new garment ${payload.code} (${payload.name}).`);
      }
      setIsModalOpen(false);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save garment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (garment: Product) => {
    if (!window.confirm(`Delete or archive garment ${garment.code} — ${garment.name}?`)) {
      return;
    }
    setError(null);
    setNotice(null);
    try {
      const res = await adminDeleteGarment(token, garment.id);
      setNotice(res.message);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete garment.");
    }
  };

  const handleUploadPhoto = async (file: File | null) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadAdminMedia(token, file);
      setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const updateSizeRow = <K extends keyof Size>(idx: number, key: K, value: Size[K]) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    }));
  };

  const filtered = garments.filter((g) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      g.code.toLowerCase().includes(q) ||
      g.name.toLowerCase().includes(q) ||
      g.occasion.toLowerCase().includes(q) ||
      g.color.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
        <div>
          <h2 className="font-serif text-2xl uppercase tracking-wider text-brand-foreground">
            Ao Dai Catalog Management
          </h2>
          <p className="text-xs font-sans text-brand-muted mt-1">
            Add, edit, price (AUD), upload imagery, and manage size availability across your archive.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-3 text-xs font-sans uppercase tracking-[0.18em] bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 inline-flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={15} />
          <span>Add New Ao Dai</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-brand-sage/35 border border-brand-border text-xs font-sans text-brand-foreground">
          {notice}
        </div>
      )}
      {error && !isModalOpen && (
        <div className="p-3.5 bg-brand-accent/10 border border-brand-accent text-xs font-sans text-brand-foreground">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code, name, occasion, colour..."
          className="w-full pl-10 pr-4 py-2.5 bg-brand-card border border-brand-border text-xs font-sans focus:outline-none focus:border-brand-foreground"
        />
      </div>

      {/* Garments Table */}
      <div className="bg-brand-card border border-brand-border overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="border-b border-brand-border bg-brand-surface/35 uppercase tracking-widest text-[10px] text-brand-muted">
              <th className="py-3 px-4">Garment</th>
              <th className="py-3 px-3">Code</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">4-Day Rate (AUD)</th>
              <th className="py-3 px-3">Available Sizes</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/50">
            {filtered.map((g) => (
              <tr key={g.id} className="hover:bg-brand-surface/15">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 aspect-[3/4] bg-brand-surface/30 shrink-0 overflow-hidden border border-brand-border/50">
                      {g.images[0] && (
                        <Image
                          src={g.images[0]}
                          alt={g.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-serif text-sm text-brand-foreground">{g.name}</p>
                      <p className="text-[11px] font-mono text-brand-muted">/{g.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono font-semibold text-brand-foreground">
                  {g.code}
                </td>
                <td className="py-3 px-3 text-brand-muted">
                  {g.occasion} · {g.color}
                </td>
                <td className="py-3 px-3 font-mono font-medium text-brand-foreground">
                  {formatAudShort(g.rentalPriceAud)}
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1">
                    {g.sizes.map((s) => (
                      <span
                        key={s.label}
                        className={
                          s.available
                            ? "px-1.5 py-0.5 border border-brand-border text-[10px] font-mono text-brand-foreground"
                            : "px-1.5 py-0.5 border border-brand-border/30 text-[10px] font-mono text-brand-muted line-through opacity-50"
                        }
                      >
                        {s.label}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={
                      g.isActive !== false
                        ? "px-2 py-0.5 bg-brand-sage/60 border border-brand-border/60 text-[10px] uppercase tracking-wider text-brand-foreground"
                        : "px-2 py-0.5 bg-brand-surface/50 border border-brand-border/50 text-[10px] uppercase tracking-wider text-brand-muted"
                    }
                  >
                    {g.isActive !== false ? "Active" : "Archived"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => openEditModal(g)}
                    className="p-1.5 text-brand-foreground hover:bg-brand-surface/50 cursor-pointer mr-1"
                    title="Edit garment"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(g)}
                    className="p-1.5 text-brand-accent hover:bg-brand-accent/10 cursor-pointer"
                    title="Delete / archive garment"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-foreground/40 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-brand-background border border-brand-foreground p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <h3 className="font-serif text-2xl uppercase tracking-wider">
                {editingGarment ? `Edit Garment ${editingGarment.code}` : "Add New Ao Dai"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-brand-muted hover:text-brand-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-brand-accent/10 border border-brand-accent text-xs font-sans">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] uppercase tracking-widest text-brand-muted">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                    className="bg-brand-card px-3 py-2 text-sm font-mono border border-brand-input-border"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] uppercase tracking-widest text-brand-muted">
                    Garment Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((p) => ({
                        ...p,
                        name: val,
                        slug: editingGarment ? p.slug : slugify(val),
                      }));
                    }}
                    className="bg-brand-card px-3 py-2 text-sm border border-brand-input-border"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] uppercase tracking-widest text-brand-muted">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    className="bg-brand-card px-3 py-2 text-sm font-mono border border-brand-input-border"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] uppercase tracking-widest text-brand-muted">
                    Base 4-Day Price (AUD) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    step="1"
                    value={form.rentalPriceAud}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, rentalPriceAud: parseFloat(e.target.value) || 0 }))
                    }
                    className="bg-brand-card px-3 py-2 text-sm font-mono border border-brand-input-border"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] uppercase tracking-widest text-brand-muted">
                    Occasion
                  </label>
                  <select
                    value={form.occasion}
                    onChange={(e) => setForm((p) => ({ ...p, occasion: e.target.value }))}
                    className="bg-brand-card px-3 py-2 text-sm border border-brand-input-border"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Tea Ceremony">Tea Ceremony</option>
                    <option value="Editorial">Editorial</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] uppercase tracking-widest text-brand-muted">
                    Colour
                  </label>
                  <select
                    value={form.color}
                    onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                    className="bg-brand-card px-3 py-2 text-sm border border-brand-input-border"
                  >
                    <option value="Ivory">Ivory</option>
                    <option value="Sage">Sage</option>
                    <option value="Terracotta">Terracotta</option>
                    <option value="Rose">Rose</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                    />
                    <span className="uppercase tracking-wider">Visible in Storefront</span>
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] uppercase tracking-widest text-brand-muted">
                    Model Height
                  </label>
                  <input
                    type="text"
                    value={form.modelHeight || ""}
                    onChange={(e) => setForm((p) => ({ ...p, modelHeight: e.target.value }))}
                    placeholder="168 cm"
                    className="bg-brand-card px-3 py-2 text-sm border border-brand-input-border"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] uppercase tracking-widest text-brand-muted">
                    Model Wearing Size
                  </label>
                  <input
                    type="text"
                    value={form.modelWearingSize || ""}
                    onChange={(e) => setForm((p) => ({ ...p, modelWearingSize: e.target.value }))}
                    placeholder="Size S"
                    className="bg-brand-card px-3 py-2 text-sm border border-brand-input-border"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-widest text-brand-muted">
                  Description (English)
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="bg-brand-card px-3 py-2 text-sm border border-brand-input-border"
                />
              </div>

              {/* Images */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-widest text-brand-muted">
                    Garment Images
                  </label>
                  <label className="px-3 py-1.5 border border-brand-foreground text-[11px] uppercase tracking-widest inline-flex items-center gap-1.5 cursor-pointer hover:bg-brand-surface/40">
                    <Upload size={12} />
                    <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadPhoto(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                {form.images.map((imgUrl, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={imgUrl}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          images: p.images.map((u, i) => (i === idx ? e.target.value : u)),
                        }))
                      }
                      className="flex-1 bg-brand-card px-3 py-2 text-xs font-mono border border-brand-input-border"
                    />
                    {form.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            images: p.images.filter((_, i) => i !== idx),
                          }))
                        }
                        className="px-2.5 border border-brand-border text-brand-accent text-xs cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, images: [...p.images, ""] }))}
                  className="text-xs underline underline-offset-4 text-brand-muted hover:text-brand-foreground cursor-pointer"
                >
                  + Add image URL
                </button>
              </div>

              {/* Sizes matrix */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-brand-muted block">
                  Sizes &amp; Measurements (cm)
                </label>
                <div className="space-y-2">
                  {form.sizes.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-6 gap-2 items-center bg-brand-card p-2 border border-brand-border/60 text-xs"
                    >
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) => updateSizeRow(idx, "label", e.target.value)}
                        className="bg-brand-background px-2 py-1 border border-brand-border font-mono"
                        placeholder="Size"
                      />
                      <input
                        type="number"
                        value={row.bust}
                        onChange={(e) => updateSizeRow(idx, "bust", Number(e.target.value))}
                        className="bg-brand-background px-2 py-1 border border-brand-border font-mono"
                        title="Bust cm"
                      />
                      <input
                        type="number"
                        value={row.waist}
                        onChange={(e) => updateSizeRow(idx, "waist", Number(e.target.value))}
                        className="bg-brand-background px-2 py-1 border border-brand-border font-mono"
                        title="Waist cm"
                      />
                      <input
                        type="number"
                        value={row.hip}
                        onChange={(e) => updateSizeRow(idx, "hip", Number(e.target.value))}
                        className="bg-brand-background px-2 py-1 border border-brand-border font-mono"
                        title="Hip cm"
                      />
                      <input
                        type="number"
                        value={row.length}
                        onChange={(e) => updateSizeRow(idx, "length", Number(e.target.value))}
                        className="bg-brand-background px-2 py-1 border border-brand-border font-mono"
                        title="Length cm"
                      />
                      <label className="inline-flex items-center gap-1.5 justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={row.available}
                          onChange={(e) => updateSizeRow(idx, "available", e.target.checked)}
                        />
                        <span className="text-[10px] uppercase">Avail</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs uppercase tracking-widest border border-brand-border text-brand-muted hover:text-brand-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 text-xs uppercase tracking-[0.2em] bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving..." : editingGarment ? "Update Garment" : "Create Garment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
