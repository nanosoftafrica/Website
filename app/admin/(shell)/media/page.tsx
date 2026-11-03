import MediaLibraryPanel from "@/components/admin/MediaLibraryPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default function MediaPage() {
  return (
    <>
      <ScreenHelp>{"All uploaded images. Use JPG, PNG, GIF or WebP files up to 5 MB. SVG files are not allowed."}</ScreenHelp>
      <MediaLibraryPanel />
    </>
  );
}
