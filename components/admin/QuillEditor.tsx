"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Quill touches `document` at import time, so it can only ever run in the
// browser — ssr:false is required here (this file is already a Client
// Component, which is the one place Next.js allows that option).
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function QuillEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  return <ReactQuill theme="snow" value={value} onChange={onChange} />;
}
