"use client";

import { useState } from "react";
import { Mail, FileText, Search, X, RefreshCw } from "lucide-react";
import { type TransactionRecord, type TransactionStatus } from "@/types";
import { adminResendInvoice, adminUpdateTransaction } from "@/lib/api";
import { formatAud } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AdminTransactionsTabProps {
  token: string;
  transactions: TransactionRecord[];
  onRefresh: () => Promise<void>;
}

const TX_STATUSES: readonly TransactionStatus[] = ["paid", "pending", "refunded", "failed"];

export default function AdminTransactionsTab({
  token,
  transactions,
  onRefresh,
}: AdminTransactionsTabProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [previewTx, setPreviewTx] = useState<TransactionRecord | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const paidSum = transactions
    .filter((t) => t.status === "paid")
    .reduce((acc, t) => acc + t.totalAud, 0);
  const pendingSum = transactions
    .filter((t) => t.status === "pending")
    .reduce((acc, t) => acc + t.totalAud, 0);
  const refundedSum = transactions
    .filter((t) => t.status === "refunded")
    .reduce((acc, t) => acc + t.totalAud, 0);

  const handleUpdateStatus = async (txId: number, status: TransactionStatus) => {
    setBusyId(txId);
    setBanner(null);
    try {
      await adminUpdateTransaction(token, txId, status);
      setBanner(`Transaction status updated to ${status.toUpperCase()}.`);
      await onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  const handleResend = async (txId: number) => {
    setBusyId(txId);
    setBanner(null);
    try {
      const updated = await adminResendInvoice(token, txId);
      setBanner(
        `Invoice ${updated.invoiceNumber} re-dispatched to ${updated.customerEmail} (${updated.invoiceEmailStatus}).`
      );
      await onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  const filtered = transactions.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.invoiceNumber.toLowerCase().includes(q) ||
      t.transactionRef.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.customerEmail.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-border pb-4">
        <h2 className="font-serif text-2xl uppercase tracking-wider text-brand-foreground">
          Transactions &amp; AUD Invoices
        </h2>
        <p className="text-xs font-sans text-brand-muted mt-1">
          Inspect all guest payments in AUD, reconcile bank transfers, preview HTML invoices, and resend invoice emails.
        </p>
      </div>

      {/* Revenue Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-brand-card border border-brand-border">
          <span className="text-[10px] font-sans uppercase tracking-widest text-brand-muted">
            Settled Revenue (Paid)
          </span>
          <p className="font-serif text-2xl text-brand-foreground mt-1">{formatAud(paidSum)}</p>
        </div>
        <div className="p-4 bg-brand-card border border-brand-border">
          <span className="text-[10px] font-sans uppercase tracking-widest text-brand-muted">
            Pending Settlement
          </span>
          <p className="font-serif text-2xl text-brand-foreground mt-1">{formatAud(pendingSum)}</p>
        </div>
        <div className="p-4 bg-brand-card border border-brand-border">
          <span className="text-[10px] font-sans uppercase tracking-widest text-brand-muted">
            Refunded
          </span>
          <p className="font-serif text-2xl text-brand-foreground mt-1">{formatAud(refundedSum)}</p>
        </div>
      </div>

      {banner && (
        <div className="p-3.5 bg-brand-sage/35 border border-brand-border text-xs font-sans text-brand-foreground">
          {banner}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {["all", ...TX_STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-sans uppercase tracking-wider border cursor-pointer transition-colors",
                statusFilter === st
                  ? "bg-brand-foreground text-brand-background border-brand-foreground"
                  : "bg-brand-card text-brand-foreground border-brand-border hover:border-brand-foreground"
              )}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice, ref, email..."
            className="w-full pl-9 pr-3 py-2 bg-brand-card border border-brand-border text-xs font-sans focus:outline-none focus:border-brand-foreground"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-brand-card border border-brand-border overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="border-b border-brand-border bg-brand-surface/35 uppercase tracking-widest text-[10px] text-brand-muted">
              <th className="py-3 px-4">Invoice / Ref</th>
              <th className="py-3 px-3">Guest Customer</th>
              <th className="py-3 px-3">Payment Method</th>
              <th className="py-3 px-3">Breakdown (AUD)</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Email Invoice</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/50">
            {filtered.map((tx) => (
              <tr key={tx.id} className="hover:bg-brand-surface/15">
                <td className="py-3 px-4 font-mono whitespace-nowrap">
                  <div className="font-semibold text-brand-foreground">{tx.invoiceNumber}</div>
                  <div className="text-[10px] text-brand-muted">{tx.transactionRef}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium text-brand-foreground">{tx.customerName}</div>
                  <div className="text-[11px] text-brand-muted">{tx.customerEmail}</div>
                </td>
                <td className="py-3 px-3 uppercase text-[11px] text-brand-foreground">
                  {tx.paymentMethod.replace("_", " ")}
                  {tx.cardLast4 && (
                    <span className="font-mono text-brand-muted ml-1">••••{tx.cardLast4}</span>
                  )}
                </td>
                <td className="py-3 px-3 font-mono whitespace-nowrap">
                  <div className="font-semibold text-brand-foreground">
                    {formatAud(tx.totalAud)}
                  </div>
                  <div className="text-[10px] text-brand-muted">
                    Rent {formatAud(tx.subtotalAud)}
                    {tx.deliveryFeeAud > 0 ? ` + Post ${formatAud(tx.deliveryFeeAud)}` : ""}
                    {tx.afterHoursFeeAud > 0 ? ` + Late ${formatAud(tx.afterHoursFeeAud)}` : ""}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <select
                    disabled={busyId === tx.id}
                    value={tx.status}
                    onChange={(e) =>
                      handleUpdateStatus(tx.id, e.target.value as TransactionStatus)
                    }
                    className="bg-brand-background border border-brand-border px-2 py-1 text-[11px] uppercase tracking-wider cursor-pointer"
                  >
                    {TX_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 bg-brand-surface/40 border border-brand-border/60 text-brand-foreground">
                    <Mail size={11} />
                    {tx.invoiceEmailStatus.replace("_", " ")}
                  </span>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                  <button
                    type="button"
                    onClick={() => setPreviewTx(tx)}
                    className="p-1.5 text-brand-foreground hover:bg-brand-surface/40 cursor-pointer"
                    title="Preview AUD Invoice HTML"
                  >
                    <FileText size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === tx.id}
                    onClick={() => handleResend(tx.id)}
                    className="p-1.5 text-brand-foreground hover:bg-brand-surface/40 cursor-pointer disabled:opacity-40"
                    title="Resend invoice email"
                  >
                    <RefreshCw size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-brand-muted">
                  No transactions match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice HTML Preview Modal */}
      {previewTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-foreground/40 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-brand-background border border-brand-foreground p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-brand-muted">
                  EMAILED INVOICE PREVIEW
                </p>
                <h3 className="font-serif text-xl uppercase tracking-wider">
                  {previewTx.invoiceNumber} — {previewTx.customerEmail}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTx(null)}
                className="p-1 text-brand-muted hover:text-brand-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <iframe
              title={`Invoice ${previewTx.invoiceNumber}`}
              sandbox=""
              srcDoc={previewTx.invoiceEmailHtml}
              className="w-full h-[540px] border border-brand-border bg-brand-card"
            />
          </div>
        </div>
      )}
    </div>
  );
}
