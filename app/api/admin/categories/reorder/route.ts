import { ProductCategory } from "@/lib/serverModels";
import { createReorderHandler } from "@/lib/adminApi";

export const PUT = createReorderHandler(ProductCategory);
