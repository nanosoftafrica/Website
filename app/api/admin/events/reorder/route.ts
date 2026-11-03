import { Event } from "@/lib/serverModels";
import { createReorderHandler } from "@/lib/adminApi";

export const PUT = createReorderHandler(Event);
