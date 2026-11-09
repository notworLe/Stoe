# ERROR LOG

## [ERR-20261109-01] Next.js Prerender Error on `/shop/[slug]`
- Thời gian phát hiện: 2026-11-09 12:56 (Vercel Build)
- Môi trường: Next.js 16.4.5, Vercel Build (Node.js, App Router with PPR/cacheComponents)
- Commit: `2f0ac82`

### 1. Hiện tượng lỗi
Vercel build fail ở bước `npm run build`:
```text
Error: Route "/shop/[slug]": Next.js encountered uncached or runtime data during prerendering.
`fetch(...)`, `cookies()`, `headers()`, `params`, `searchParams`, or `connection()` accessed outside of `<Suspense>` prevents the route from being prerendered.
Export encountered an error on /shop/[slug]/page: /shop/[slug], exiting the build.
⨯ Next.js build worker exited with code: 1 and signal: null
Error: [BUILD_UTILS_SPAWN_1] Command "npm run build" exited with 1
```

### 2. Nguyên nhân
Trong Next.js 15/16 và cấu hình Partial Prerendering (`cacheComponents: true`, `partialPrefetching: true` trong `next.config.ts`), `params` của dynamic route (`/shop/[slug]`) là runtime/dynamic data.
Việc `await params` trực tiếp trong component chính của page mà không có `<Suspense>` boundary chặn quá trình static prerender của Next.js, dẫn đến lỗi prerender-error.

### 3. Cách khắc phục
- Tách phần xử lý đọc `params` thành component con async (`ProductContent`).
- Ở component chính (`ProductPage`), bọc component con trong `<Suspense fallback={<... />}>`.
- File đã sửa: `frontend/src/app/shop/[slug]/page.tsx`.

### 4. Kết quả kiểm thử
- `cd frontend && npm run build`: Exit code 0 (thành công).
- Route `/shop/[slug]` hiển thị trạng thái `◐ (Partial Prerender)` đúng chuẩn.
- `npm run lint` & `npx tsc --noEmit`: 0 lỗi.
