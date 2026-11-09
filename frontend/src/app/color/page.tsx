export default function Color() {
    return (
        <main className="min-h-screen bg-brand-background flex flex-col items-center justify-center gap-6 p-8">
            {/* Token verify: background + foreground */}
            <h1 className="font-serif text-brand-foreground text-4xl uppercase tracking-widest">
                LUA Studio
            </h1>

            {/* Token verify: surface */}
            <div className="bg-brand-surface px-8 py-4 text-brand-foreground font-sans text-sm uppercase tracking-widest">
                surface · D6CFB0
            </div>

            {/* Token verify: card */}
            <div className="bg-brand-card border border-brand-border px-8 py-4 text-brand-muted font-sans text-sm">
                card · F4F1E9 · border · A09A8A
            </div>

            {/* Token verify: accents */}
            <div className="flex gap-3">
                <span className="bg-brand-lavender px-4 py-2 text-brand-foreground text-xs font-sans">lavender</span>
                <span className="bg-brand-peach px-4 py-2 text-brand-foreground text-xs font-sans">peach</span>
                <span className="bg-brand-gold px-4 py-2 text-brand-foreground text-xs font-sans">gold</span>
                <span className="bg-brand-sage px-4 py-2 text-brand-foreground text-xs font-sans">sage</span>
            </div>

            {/* Token verify: button primary */}
            <button className="bg-brand-foreground text-brand-on-foreground px-8 py-3 text-xs uppercase tracking-[0.12em] font-sans cursor-pointer hover:opacity-90 transition-opacity duration-200">
                Xem bộ sưu tập
            </button>

            <p className="text-brand-muted font-sans text-xs">
                Giai đoạn 1 — Token verify ✓
            </p>
        </main>
    );
}
