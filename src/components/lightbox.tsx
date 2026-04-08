"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useEffect } from "react";

export type LightboxPhoto = {
  id: string;
  url: string;
  width: number;
  height: number;
  description?: string | null;
};

export function Lightbox(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: LightboxPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
}) {
  const photo = props.photos[props.index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!props.open) return;
      if (e.key === "ArrowLeft") props.onIndexChange((props.index - 1 + props.photos.length) % props.photos.length);
      if (e.key === "ArrowRight") props.onIndexChange((props.index + 1) % props.photos.length);
      if (e.key === "Escape") props.onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props]);

  if (!photo) return null;

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl">
            <div className="relative overflow-hidden rounded-lg bg-black">
              <Image
                src={photo.url}
                alt={photo.description ?? ""}
                width={photo.width}
                height={photo.height}
                className="h-[70vh] w-full object-contain"
                sizes="(max-width: 768px) 100vw, 1000px"
                priority
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-zinc-200">
              <button
                className="rounded-md px-3 py-2 hover:bg-white/10"
                onClick={() => props.onIndexChange((props.index - 1 + props.photos.length) % props.photos.length)}
              >
                ←
              </button>
              <div className="truncate px-3">{photo.description ?? ""}</div>
              <button
                className="rounded-md px-3 py-2 hover:bg-white/10"
                onClick={() => props.onIndexChange((props.index + 1) % props.photos.length)}
              >
                →
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

