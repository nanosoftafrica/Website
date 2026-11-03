import { listAllTestimonials } from "@/lib/adminDb";
import TestimonialsPanel from "@/components/admin/TestimonialsPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const testimonials = await listAllTestimonials();
  return (
    <>
      <ScreenHelp>{"Testimonials appear in the customer quotes section of the home page. Untick Active to hide one."}</ScreenHelp>
      <TestimonialsPanel initialItems={testimonials} />
    </>
  );
}
