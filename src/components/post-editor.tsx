"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PostEditor(props: {
  postId: string;
  title: string;
  content: string;
  visibility: "public" | "friends" | "private";
}) {
  const router = useRouter();
  const [title, setTitle] = useState(props.title);
  const [content, setContent] = useState(props.content);
  const [visibility, setVisibility] = useState(props.visibility);
  const [busy, setBusy] = useState(false);

  async function doSave() {
    const resp = await fetch(`/api/posts/${props.postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, visibility }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.error ?? "保存失败");
  }

  async function publish() {
    setBusy(true);
    try {
      await doSave();
      const resp = await fetch(`/api/posts/${props.postId}/publish`, { method: "POST" });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error ?? "发布失败");
      router.push("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <input
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-black"
        placeholder="标题（可选）"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="h-56 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-black"
        placeholder="正文（支持 Markdown / 纯文本）"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="flex items-center gap-3">
        <label className="text-sm text-zinc-600 dark:text-zinc-300">可见性</label>
        <select
          className="rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as "public" | "friends" | "private")}
        >
          <option value="public">公开</option>
          <option value="friends">好友可见（预留）</option>
          <option value="private">私密</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={busy}
          className="rounded-md px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
          onClick={async () => {
            setBusy(true);
            try {
              await doSave();
              router.refresh();
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : "保存失败";
              alert(msg);
            } finally {
              setBusy(false);
            }
          }}
        >
          保存草稿
        </button>
        <button
          disabled={busy}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-black"
          onClick={() =>
            publish().catch((e: unknown) => {
              const msg = e instanceof Error ? e.message : "发布失败";
              alert(msg);
            })
          }
        >
          发布到时间轴
        </button>
      </div>
    </div>
  );
}
