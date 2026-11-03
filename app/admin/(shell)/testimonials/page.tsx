import { listAllTestimonials } from "@/lib/adminDb";
import TestimonialsPanel from "@/components/admin/TestimonialsPanel";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const testimonials = await listAllTestimonials();
  return <TestimonialsPanel initialItems={testimonials} />;
}
