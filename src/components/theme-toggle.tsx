"use client";

import * as Switch from "@radix-ui/react-switch";
import { useEffect, useState } from "react";

function getInitial() {
  if (typeof window === "undefined") return false;
  const saved = window.localStorage.getItem("pb_theme");
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const init = getInitial();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(init);
    document.documentElement.classList.toggle("dark", init);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("pb_theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
      <span>暗黑</span>
      <Switch.Root
        checked={dark}
        onCheckedChange={setDark}
        className="relative h-6 w-11 rounded-full bg-zinc-200 shadow-inner outline-none data-[state=checked]:bg-zinc-700"
      >
        <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-5" />
      </Switch.Root>
    </div>
  );
}
