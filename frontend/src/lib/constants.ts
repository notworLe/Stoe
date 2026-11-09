// V1
// export const NAV_LINKS = [
//   { label: "Home", href: "/" },
//   { label: "Shop / Collection", href: "/shop" },
//   { label: "How to Rent", href: "/how-to-rent" },
//   { label: "Size Guide", href: "/size-guide" },
//   { label: "FAQs", href: "/faqs" },
//   { label: "Contact", href: "/contact" },
// ] as const;

// V2
export const NAV_LINKS = [
  { id: "instagram", label: "INSTAGRAM", href: "https://www.instagram.com/luastudio.melb" },
  { id: "home", label: "HOME", href: "/" },
  { id: "about", label: "ABOUT", href: "/about" },
  { id: "logo", label: "LỤA STUDIO", href: "/" },
  { id: "process", label: "PROCESS", href: "/size-guide" },
  { id: "portfolio", label: "PORTFOLIO", href: "/portfolio" },
  { id: "contact", label: "GET IN TOUCH", href: "/contact" },
] as const;

export const STUDIO_INFO = {
  name: "LUA Studio",
  tagline: "Cho thuê áo dài editorial",
  address: "TODO: địa chỉ studio",
  email: "hello@luastudio.vn",
  instagram: "https://www.instagram.com/luastudio.melb",
  facebook: "https://www.facebook.com/profile.php?id=61586432396347",
} as const;
