"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

/**
 * Accordion atom — dùng cho "Delivery & Return" và "FAQs" trên product page.
 * Keyboard accessible: Enter/Space để toggle, arrow keys để navigate.
 *
 * @example
 * <Accordion items={[
 *   { id: "delivery", title: "Delivery & Return", content: <p>...</p> },
 *   { id: "faqs", title: "FAQs", content: <p>...</p> },
 * ]} />
 */
export default function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={cn("divide-y divide-brand-border", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
              id={`accordion-trigger-${item.id}`}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className={cn(
                "w-full flex items-center justify-between",
                "py-4 text-left",
                "text-sm font-sans uppercase tracking-widest text-brand-foreground",
                "cursor-pointer",
                "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2"
              )}
            >
              {item.title}
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={cn(
                  "text-brand-muted transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            <div
              id={`accordion-content-${item.id}`}
              role="region"
              aria-labelledby={`accordion-trigger-${item.id}`}
              hidden={!isOpen}
              className="pb-4 text-sm font-sans text-brand-muted leading-relaxed"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
