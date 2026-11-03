"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useProductSelection } from "./ProductSelectionContext";

// Reads ?product=<name> (set by product-detail-page CTAs like "Get a Free
// Demo") and carries it into the demo form's product dropdown, so a visitor
// coming from /products/nano-pos doesn't have to reselect it by hand.
export default function ProductQueryPreselect() {
  const searchParams = useSearchParams();
  const { setSelected } = useProductSelection();

  useEffect(() => {
    const product = searchParams.get("product");
    if (product) setSelected(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
