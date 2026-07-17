"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoDialog } from "./video-dialog";

/** Page-header primary action — admin only (the page checks the role). */
export function AddVideoButton({ categories }: { categories: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden />
        Add a video
      </Button>
      {open ? (
        <VideoDialog categories={categories} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
