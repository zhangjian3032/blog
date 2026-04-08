"use client";

import Masonry from "react-masonry-css";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Lightbox, type LightboxPhoto } from "@/components/lightbox";

type TimelinePost = {
  id: string;
  title: string;
  content: string;
  publishedAt: string | null;
  createdAt: string;
  user: { id: string; username: string; avatarUrl: string | null };
  photos: Array<{
    id: string;
    thumbMd: string;
    thumbLg: string;
    width: number;
    height: number;
    aiDescription: string | null;
  }>;
};

function monthKey(d: Date) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

export function Timeline(props: { posts: TimelinePost[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, TimelinePost[]>();
    for (const p of props.posts) {
      const date = new Date(p.publishedAt ?? p.createdAt);
      const key = monthKey(date);
      map.set(key, [...(map.get(key) ?? []), p]);
    }
    return Array.from(map.entries());
  }, [props.posts]);

  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<LightboxPhoto[]>([]);
  const [index, setIndex] = useState(0);

  return (
    <div className="space-y-10">
      {groups.map(([key, posts]) => (
        <section key={key} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-zinc-900 dark:bg-zinc-100" />
            <h2 className="text-lg font-semibold tracking-tight">{key}</h2>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {posts.map((p) => (
            <div key={p.id} className="space-y-4">
              <Masonry
                breakpointCols={{ default: 3, 1024: 3, 768: 2, 480: 1 }}
                className="flex w-auto gap-3"
                columnClassName="space-y-3"
              >
                {p.photos.map((ph, idx) => (
                  <button
                    key={ph.id}
                    className="group relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900"
                    onClick={() => {
                      const lb = p.photos.map((x) => ({
                        id: x.id,
                        url: x.thumbLg,
                        width: x.width,
                        height: x.height,
                        description: x.aiDescription,
                      }));
                      setPhotos(lb);
                      setIndex(idx);
                      setOpen(true);
                    }}
                  >
                    <Image
                      src={ph.thumbMd}
                      alt={ph.aiDescription ?? ""}
                      width={ph.width}
                      height={ph.height}
                      className="h-auto w-full transition-transform group-hover:scale-[1.01]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </button>
                ))}
              </Masonry>

              {(p.title || p.content) && (
                <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-black dark:ring-zinc-800">
                  {p.title ? <div className="text-base font-semibold">{p.title}</div> : null}
                  {p.content ? (
                    <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                      {p.content}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </section>
      ))}

      <Lightbox
        open={open}
        onOpenChange={setOpen}
        photos={photos}
        index={index}
        onIndexChange={setIndex}
      />
    </div>
  );
}

