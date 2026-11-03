"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Shared between ProductsTabs and DemoForm — ports the original page's
// side effect where switching the active product tab also updates the
// demo form's "which product interests you?" select.
const ProductSelectionContext = createContext<{
  selected: string;
  setSelected: (name: string) => void;
} | null>(null);

export function ProductSelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState("");
  return (
    <ProductSelectionContext.Provider value={{ selected, setSelected }}>{children}</ProductSelectionContext.Provider>
  );
}

export function useProductSelection() {
  const ctx = useContext(ProductSelectionContext);
  if (!ctx) throw new Error("useProductSelection must be used within ProductSelectionProvider");
  return ctx;
}
