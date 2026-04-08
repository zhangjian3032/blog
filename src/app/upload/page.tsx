import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { Uploader } from "@/components/uploader";

export default async function UploadPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">上传照片</h1>
      <Uploader />
    </div>
  );
}

