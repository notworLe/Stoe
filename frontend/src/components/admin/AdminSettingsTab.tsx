"use client";

import { useState } from "react";
import { Upload, Save, Check, AlertTriangle } from "lucide-react";
import { type SiteSettings } from "@/types";
import { updateAdminSiteSettings, uploadAdminMedia } from "@/lib/api";

interface AdminSettingsTabProps {
  token: string;
  initialSettings: SiteSettings;
  onSaved: (updated: SiteSettings) => void;
}

export default function AdminSettingsTab({
  token,
  initialSettings,
  onSaved,
}: AdminSettingsTabProps) {
  const [form, setForm] = useState<SiteSettings>(initialSettings);
  const [paragraphsText, setParagraphsText] = useState<string>(
    initialSettings.aboutParagraphs.join("\n\n")
  );
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleField = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleMetadataChange = (
    idx: number,
    key: "label" | "value" | "subtitle",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      metadataItems: prev.metadataItems.map((item, i) =>
        i === idx ? { ...item, [key]: value } : item
      ),
    }));
  };

  const handleUploadImage = async (
    field: "logoUrl" | "heroImageUrl" | "aboutImageUrl" | "spotlightImageUrl",
    file: File | null
  ) => {
    if (!file) return;
    setUploadingField(field);
    setStatusMessage(null);
    try {
      const url = await uploadAdminMedia(token, file);
      handleField(field, url);
      setStatusMessage({
        type: "success",
        text: `Image uploaded (${url}). Click "Save Website Settings" to publish.`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Image upload failed.",
      });
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const cleanedParagraphs = paragraphsText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

      const payload: SiteSettings = {
        ...form,
        aboutParagraphs: cleanedParagraphs.length > 0 ? cleanedParagraphs : [""],
      };

      const saved = await updateAdminSiteSettings(token, payload);
      setForm(saved);
      setParagraphsText(saved.aboutParagraphs.join("\n\n"));
      onSaved(saved);
      setStatusMessage({
        type: "success",
        text: "Website settings saved to PostgreSQL and published live to the storefront.",
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
        <div>
          <h2 className="font-serif text-2xl uppercase tracking-wider text-brand-foreground">
            Website Information &amp; Storefront Settings
          </h2>
          <p className="text-xs font-sans text-brand-muted mt-1">
            Edit brand name, logo, editorial copy, contact details, and AUD rental fee rules.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 text-xs font-sans uppercase tracking-[0.2em] bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Save size={14} />
          <span>{isSaving ? "Saving..." : "Save Website Settings"}</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={
            statusMessage.type === "success"
              ? "p-4 bg-brand-sage/35 border border-brand-border text-xs font-sans text-brand-foreground flex items-center gap-2"
              : "p-4 bg-brand-accent/10 border border-brand-accent text-xs font-sans text-brand-foreground flex items-center gap-2"
          }
        >
          {statusMessage.type === "success" ? <Check size={15} /> : <AlertTriangle size={15} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 1. Brand Identity & Logo */}
      <section className="p-6 bg-brand-card border border-brand-border space-y-5">
        <h3 className="font-serif text-lg uppercase tracking-wider border-b border-brand-border/50 pb-2">
          1. Brand Identity &amp; Logo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldInput
            label="Website / Brand Name"
            value={form.siteName}
            onChange={(v) => handleField("siteName", v)}
          />
          <FieldInput
            label="Brand Handle / Slug"
            value={form.siteHandle}
            onChange={(v) => handleField("siteHandle", v)}
          />
          <div className="md:col-span-2">
            <FieldInput
              label="Tagline"
              value={form.tagline}
              onChange={(v) => handleField("tagline", v)}
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <span className="text-[11px] font-sans uppercase tracking-widest text-brand-muted">
                Logo Preview
              </span>
              <div className="h-16 w-16 border border-brand-border bg-brand-background flex items-center justify-center p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.logoUrl}
                  alt="Logo preview"
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
              </div>
            </div>
            <div className="sm:col-span-7">
              <FieldInput
                label="Logo URL (Default: /images/image.png)"
                value={form.logoUrl}
                onChange={(v) => handleField("logoUrl", v)}
              />
            </div>
            <div className="sm:col-span-3">
              <label className="w-full py-3 px-4 border border-brand-foreground text-xs font-sans uppercase tracking-widest text-brand-foreground hover:bg-brand-surface/40 inline-flex items-center justify-center gap-2 cursor-pointer">
                <Upload size={14} />
                <span>{uploadingField === "logoUrl" ? "Uploading..." : "Upload Logo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadImage("logoUrl", e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Rental Rules & AUD Fees */}
      <section className="p-6 bg-brand-card border border-brand-border space-y-5">
        <h3 className="font-serif text-lg uppercase tracking-wider border-b border-brand-border/50 pb-2">
          2. Rental Rules &amp; Fees ({form.currency})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <FieldInput
            label="Currency"
            value={form.currency}
            onChange={(v) => handleField("currency", v.toUpperCase())}
          />
          <FieldNumber
            label="Transport Post Fee (AUD)"
            value={form.transportPostFeeAud}
            step="0.05"
            onChange={(v) => handleField("transportPostFeeAud", v)}
          />
          <FieldNumber
            label="After-Hours Fee (AUD)"
            value={form.afterHoursFeeAud}
            step="1"
            onChange={(v) => handleField("afterHoursFeeAud", v)}
          />
          <FieldNumber
            label="Turnaround Gap (Days)"
            value={form.turnaroundGapDays}
            step="1"
            onChange={(v) => handleField("turnaroundGapDays", Math.max(0, Math.round(v)))}
          />
          <FieldInput
            label="Studio Close Time"
            value={form.businessCloseTime}
            onChange={(v) => handleField("businessCloseTime", v)}
          />
        </div>
      </section>

      {/* 3. Homepage Editorial Copy */}
      <section className="p-6 bg-brand-card border border-brand-border space-y-5">
        <h3 className="font-serif text-lg uppercase tracking-wider border-b border-brand-border/50 pb-2">
          3. Homepage Hero, About &amp; Spotlight
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldInput
            label="Hero Title"
            value={form.heroTitle}
            onChange={(v) => handleField("heroTitle", v)}
          />
          <FieldInput
            label="Hero Subtitle"
            value={form.heroSubtitle}
            onChange={(v) => handleField("heroSubtitle", v)}
          />
          <div className="md:col-span-2">
            <FieldTextarea
              label="Hero Editorial Quote"
              rows={2}
              value={form.heroQuote}
              onChange={(v) => handleField("heroQuote", v)}
            />
          </div>
          <FieldInput
            label="Hero Image URL"
            value={form.heroImageUrl}
            onChange={(v) => handleField("heroImageUrl", v)}
          />
          <FieldInput
            label="About Image URL"
            value={form.aboutImageUrl}
            onChange={(v) => handleField("aboutImageUrl", v)}
          />
          <FieldInput
            label="About Section Heading"
            value={form.aboutTitle}
            onChange={(v) => handleField("aboutTitle", v)}
          />
          <FieldInput
            label="Spotlight Image URL"
            value={form.spotlightImageUrl}
            onChange={(v) => handleField("spotlightImageUrl", v)}
          />
          <div className="md:col-span-2">
            <FieldTextarea
              label="About Paragraphs (separate paragraphs with a blank line)"
              rows={5}
              value={paragraphsText}
              onChange={setParagraphsText}
            />
          </div>
          <div className="md:col-span-2">
            <FieldTextarea
              label="Spotlight Mission Quote"
              rows={2}
              value={form.spotlightQuote}
              onChange={(v) => handleField("spotlightQuote", v)}
            />
          </div>
        </div>

        {/* Metadata Bar 3 columns */}
        <div className="pt-3 border-t border-brand-border/40 space-y-3">
          <p className="text-xs font-sans uppercase tracking-widest text-brand-muted">
            Pre-Footer Metadata Bar (3 Columns)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {form.metadataItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-brand-background border border-brand-border/60 space-y-2.5">
                <FieldInput
                  label={`Column ${idx + 1} Label`}
                  value={item.label}
                  onChange={(v) => handleMetadataChange(idx, "label", v)}
                />
                <FieldInput
                  label="Value"
                  value={item.value}
                  onChange={(v) => handleMetadataChange(idx, "value", v)}
                />
                <FieldInput
                  label="Subtitle"
                  value={item.subtitle || ""}
                  onChange={(v) => handleMetadataChange(idx, "subtitle", v)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Contact, Social & Bank / PayID */}
      <section className="p-6 bg-brand-card border border-brand-border space-y-5">
        <h3 className="font-serif text-lg uppercase tracking-wider border-b border-brand-border/50 pb-2">
          4. Studio Contact, Social Links &amp; Australian Bank / PayID
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FieldInput
              label="Melbourne Studio Address"
              value={form.studioAddress}
              onChange={(v) => handleField("studioAddress", v)}
            />
          </div>
          <FieldInput
            label="Contact Email"
            value={form.contactEmail}
            onChange={(v) => handleField("contactEmail", v)}
          />
          <FieldInput
            label="Phone Number"
            value={form.contactPhone}
            onChange={(v) => handleField("contactPhone", v)}
          />
          <FieldInput
            label="Instagram URL"
            value={form.instagramUrl}
            onChange={(v) => handleField("instagramUrl", v)}
          />
          <FieldInput
            label="Facebook URL"
            value={form.facebookUrl}
            onChange={(v) => handleField("facebookUrl", v)}
          />
          <FieldInput
            label="Bank Account Name"
            value={form.bankAccountName}
            onChange={(v) => handleField("bankAccountName", v)}
          />
          <FieldInput
            label="PayID Email"
            value={form.payidEmail}
            onChange={(v) => handleField("payidEmail", v)}
          />
          <FieldInput
            label="BSB"
            value={form.bankBsb}
            onChange={(v) => handleField("bankBsb", v)}
          />
          <FieldInput
            label="Account Number"
            value={form.bankAccountNumber}
            onChange={(v) => handleField("bankAccountNumber", v)}
          />
        </div>
      </section>
    </form>
  );
}

function FieldInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-sans uppercase tracking-widest text-brand-muted">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-brand-background px-3.5 py-2.5 text-sm font-sans border border-brand-input-border focus:outline-none focus:border-brand-foreground"
      />
    </div>
  );
}

function FieldNumber({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-sans uppercase tracking-widest text-brand-muted">
        {label}
      </label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-brand-background px-3.5 py-2.5 text-sm font-mono border border-brand-input-border focus:outline-none focus:border-brand-foreground"
      />
    </div>
  );
}

function FieldTextarea({
  label,
  rows,
  value,
  onChange,
}: {
  label: string;
  rows: number;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-sans uppercase tracking-widest text-brand-muted">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-brand-background px-3.5 py-2.5 text-sm font-sans border border-brand-input-border focus:outline-none focus:border-brand-foreground"
      />
    </div>
  );
}
