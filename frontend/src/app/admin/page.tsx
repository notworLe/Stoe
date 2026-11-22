"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  Shirt,
  CalendarCheck,
  Receipt,
  LogOut,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  type AdminOverview,
  type AdminUser,
  type BookingRecord,
  type Product,
  type SiteSettings,
  type TransactionRecord,
} from "@/types";
import {
  adminListBookings,
  adminListGarments,
  adminListTransactions,
  adminLogin,
  fetchAdminMe,
  fetchAdminOverview,
  fetchSiteSettings,
} from "@/lib/api";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { DELIVERY_METHOD_LABELS, formatAud } from "@/lib/constants";
import { cn } from "@/lib/utils";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";
import AdminGarmentsTab from "@/components/admin/AdminGarmentsTab";
import AdminBookingsTab from "@/components/admin/AdminBookingsTab";
import AdminTransactionsTab from "@/components/admin/AdminTransactionsTab";

type AdminTab = "overview" | "settings" | "garments" | "bookings" | "transactions";

const TOKEN_STORAGE_KEY = "maisondelua_admin_token";

export default function AdminPage() {
  const { settings: liveStorefrontSettings, setSettingsLocally } = useSiteSettings();

  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(liveStorefrontSettings);
  const [garments, setGarments] = useState<Product[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const loadAllAdminData = useCallback(async (authToken: string) => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const [ov, st, gm, bk, tx] = await Promise.all([
        fetchAdminOverview(authToken),
        fetchSiteSettings(),
        adminListGarments(authToken),
        adminListBookings(authToken),
        adminListTransactions(authToken),
      ]);
      setOverview(ov);
      setSiteSettings(st);
      setSettingsLocally(st);
      setGarments(gm);
      setBookings(bk);
      setTransactions(tx);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : "Failed to load admin data.");
    } finally {
      setIsLoadingData(false);
    }
  }, [setSettingsLocally]);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      const saved =
        typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
      if (!saved) {
        if (active) setIsCheckingAuth(false);
        return;
      }
      try {
        const me = await fetchAdminMe(saved);
        if (!active) return;
        setToken(saved);
        setAdminUser(me);
        await loadAllAdminData(saved);
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      } finally {
        if (active) setIsCheckingAuth(false);
      }
    };
    void bootstrap();
    return () => {
      active = false;
    };
  }, [loadAllAdminData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      const res = await adminLogin(email.trim(), password);
      localStorage.setItem(TOKEN_STORAGE_KEY, res.accessToken);
      setToken(res.accessToken);
      setAdminUser(res.admin);
      await loadAllAdminData(res.accessToken);
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : "Cannot reach backend API. Ensure FastAPI is running on port 8000."
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setAdminUser(null);
  };

  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-brand-background flex items-center justify-center">
        <p className="font-serif text-sm uppercase tracking-widest text-brand-muted animate-pulse">
          Verifying studio session...
        </p>
      </main>
    );
  }

  // ── ADMIN SIGN-IN VIEW ─────────────────────────────────────────────────────
  if (!token || !adminUser) {
    return (
      <main className="min-h-screen bg-brand-background text-brand-foreground flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-brand-card border border-brand-border p-8 md:p-10 space-y-6">
          <div className="flex flex-col items-center text-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={liveStorefrontSettings.logoUrl}
              alt={liveStorefrontSettings.siteName}
              className="h-14 w-14 object-contain mix-blend-multiply"
            />
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-brand-muted">
                STUDIO MANAGEMENT CONSOLE
              </p>
              <h1 className="font-serif text-2xl uppercase tracking-[0.2em] text-brand-foreground mt-1">
                {liveStorefrontSettings.siteName}
              </h1>
            </div>
          </div>

          {authError && (
            <div className="p-3.5 bg-brand-accent/10 border border-brand-accent text-xs font-sans flex items-start gap-2">
              <AlertTriangle size={15} className="text-brand-accent shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-brand-muted">
                Admin Email
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                placeholder="admin@maisondelua.com.au"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-background px-4 py-3 text-sm font-sans border border-brand-input-border focus:outline-none focus:border-brand-foreground"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans uppercase tracking-widest text-brand-muted">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter studio password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-background px-4 py-3 text-sm font-sans border border-brand-input-border focus:outline-none focus:border-brand-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 text-xs font-sans uppercase tracking-[0.2em] bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isLoggingIn ? "Signing In..." : "Sign In to Admin Console"}
            </button>
          </form>

          <div className="pt-4 border-t border-brand-border/50 text-center space-y-2 text-[11px] font-sans text-brand-muted">
            <p>Authorised Maison de Lua studio administrators only.</p>
            <Link
              href="/"
              className="inline-block uppercase tracking-widest text-brand-foreground underline underline-offset-4"
            >
              ← Return to Storefront
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── AUTHENTICATED ADMIN CONSOLE ────────────────────────────────────────────
  const navItems: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={15} /> },
    { id: "settings", label: "Website Info", icon: <Settings size={15} /> },
    { id: "garments", label: `Ao Dai (${garments.length})`, icon: <Shirt size={15} /> },
    { id: "bookings", label: `Bookings (${bookings.length})`, icon: <CalendarCheck size={15} /> },
    { id: "transactions", label: `Transactions (${transactions.length})`, icon: <Receipt size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-brand-background text-brand-foreground flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 shrink-0 bg-brand-surface border-b lg:border-b-0 lg:border-r border-brand-border flex flex-col justify-between">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-brand-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={siteSettings.logoUrl}
              alt={siteSettings.siteName}
              className="h-10 w-10 object-contain mix-blend-multiply"
            />
            <div>
              <p className="font-serif text-sm uppercase tracking-[0.18em] text-brand-foreground">
                {siteSettings.siteName}
              </p>
              <p className="text-[10px] font-sans uppercase tracking-widest text-brand-muted">
                Admin · {siteSettings.currency}
              </p>
            </div>
          </div>

          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-sans uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer border",
                  activeTab === item.id
                    ? "bg-brand-foreground text-brand-background border-brand-foreground"
                    : "bg-transparent text-brand-foreground border-transparent hover:bg-brand-background/50"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-brand-border hidden lg:flex flex-col gap-3 text-xs font-sans">
          <div className="text-brand-muted">
            <p className="font-medium text-brand-foreground">{adminUser.fullName}</p>
            <p className="text-[11px] truncate">{adminUser.email}</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 uppercase tracking-wider text-brand-foreground hover:opacity-75"
          >
            <ExternalLink size={13} />
            <span>View Storefront</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 uppercase tracking-wider text-brand-muted hover:text-brand-accent cursor-pointer text-left"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] font-sans uppercase tracking-[0.22em] text-brand-muted">
            @{siteSettings.siteHandle} · STUDIO CONSOLE
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadAllAdminData(token)}
              disabled={isLoadingData}
              className="px-3 py-1.5 text-[11px] font-sans uppercase tracking-widest border border-brand-border hover:border-brand-foreground inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={12} className={isLoadingData ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="lg:hidden px-3 py-1.5 text-[11px] font-sans uppercase tracking-widest border border-brand-border text-brand-muted cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {dataError && (
          <div className="p-4 bg-brand-accent/10 border border-brand-accent text-xs font-sans">
            {dataError}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h1 className="font-serif text-3xl uppercase tracking-wider">Studio Overview</h1>
              <p className="text-xs font-sans text-brand-muted mt-1">
                Live metrics across bookings, garment inventory, and AUD transactions.
              </p>
            </div>

            {overview && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  label="Paid Revenue (AUD)"
                  value={formatAud(overview.paidRevenueAud)}
                  sub={`Pending: ${formatAud(overview.pendingRevenueAud)}`}
                />
                <KpiCard
                  label="Active Bookings"
                  value={String(overview.activeBookings)}
                  sub={`Total records: ${overview.totalBookings}`}
                />
                <KpiCard
                  label="Archive Garments"
                  value={String(overview.activeGarments)}
                  sub={`Total catalog: ${overview.totalGarments}`}
                />
                <KpiCard
                  label="Invoices Issued"
                  value={String(overview.totalTransactions)}
                  sub={`Currency: ${overview.currency}`}
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="p-5 bg-brand-card border border-brand-border space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border/50 pb-2">
                  <h2 className="font-serif text-lg uppercase tracking-wider">Recent Bookings</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("bookings")}
                    className="text-[11px] uppercase tracking-widest underline underline-offset-4 cursor-pointer"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-brand-border/40 text-xs font-sans">
                  {bookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-brand-foreground">
                          <span className="font-mono mr-1.5">{b.garmentCode}</span>
                          {b.customerName}
                        </p>
                        <p className="text-[11px] text-brand-muted">
                          {DELIVERY_METHOD_LABELS[b.deliveryMethod]} · {b.startDate} → {b.endDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-medium">{formatAud(b.totalAud)}</p>
                        <p className="text-[10px] uppercase tracking-wider text-brand-muted">
                          {b.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="p-5 bg-brand-card border border-brand-border space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border/50 pb-2">
                  <h2 className="font-serif text-lg uppercase tracking-wider">
                    Recent Transactions
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("transactions")}
                    className="text-[11px] uppercase tracking-widest underline underline-offset-4 cursor-pointer"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-brand-border/40 text-xs font-sans">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-mono font-medium text-brand-foreground">
                          {tx.invoiceNumber}
                        </p>
                        <p className="text-[11px] text-brand-muted">
                          {tx.customerName} · {tx.paymentMethod.replace("_", " ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-medium">{formatAud(tx.totalAud)}</p>
                        <p className="text-[10px] uppercase tracking-wider text-brand-muted">
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <AdminSettingsTab
            token={token}
            initialSettings={siteSettings}
            onSaved={(updated) => {
              setSiteSettings(updated);
              setSettingsLocally(updated);
            }}
          />
        )}

        {activeTab === "garments" && (
          <AdminGarmentsTab
            token={token}
            garments={garments}
            onRefresh={() => loadAllAdminData(token)}
          />
        )}

        {activeTab === "bookings" && (
          <AdminBookingsTab
            token={token}
            bookings={bookings}
            onRefresh={() => loadAllAdminData(token)}
          />
        )}

        {activeTab === "transactions" && (
          <AdminTransactionsTab
            token={token}
            transactions={transactions}
            onRefresh={() => loadAllAdminData(token)}
          />
        )}
      </main>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="p-5 bg-brand-card border border-brand-border flex flex-col gap-1.5">
      <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-brand-muted">
        {label}
      </span>
      <span className="font-serif text-3xl text-brand-foreground">{value}</span>
      <span className="text-[11px] font-sans text-brand-muted">{sub}</span>
    </div>
  );
}
