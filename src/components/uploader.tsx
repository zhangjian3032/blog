"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function Uploader() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const totalSizeMB = useMemo(
    () => (files.reduce((a, f) => a + f.size, 0) / 1024 / 1024).toFixed(1),
    [files]
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const next = Array.from(e.target.files ?? []);
            setFiles(next.slice(0, 50));
          }}
        />
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          已选择 {files.length} 张，合计 {totalSizeMB} MB（单次最多 50 张，单张最大 30MB）
        </div>
      </div>

      <button
        disabled={busy || files.length === 0}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-black"
        onClick={async () => {
          setBusy(true);
          try {
            const fd = new FormData();
            for (const f of files) fd.append("files", f);
            const resp = await fetch("/api/photos/upload", { method: "POST", body: fd });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data?.error ?? "上传失败");
            router.push(`/posts/${data.postId}/edit`);
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "上传失败";
            alert(msg);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "上传中…" : "开始上传并生成草稿"}
      </button>
    </div>
  );
}
