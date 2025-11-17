import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { UserRole } from "@prisma/client";
import { requireRole } from "../../../lib/auth/guards";
import { createSupabaseServiceClient } from "../../../lib/supabase/service";

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "townapp-media";

export async function POST(request: Request) {
  const auth = await requireRole([
    UserRole.SUPER_ADMIN,
    UserRole.TOWN_ADMIN,
    UserRole.CONTENT_MANAGER,
  ]);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase service role key is not configured." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folderInput = formData.get("folder")?.toString().trim() ?? "";
  const folder = folderInput.replace(/^\/+|\/+$/g, "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const originalName =
    "name" in file && typeof file.name === "string" ? file.name : "upload";
  const extensionFromName = originalName.includes(".")
    ? originalName.split(".").pop()
    : undefined;
  const extensionFromType = file.type?.split("/").pop();
  const extension = (extensionFromName || extensionFromType || "bin").toLowerCase();
  const fileName = `${randomUUID()}.${extension}`;
  const storagePath = [folder, fileName].filter(Boolean).join("/");

  try {
    const supabase = createSupabaseServiceClient();
    const uploadResponse = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadResponse.error) {
      return NextResponse.json(
        { error: uploadResponse.error.message },
        { status: 400 }
      );
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    return NextResponse.json({
      path: uploadResponse.data?.path ?? storagePath,
      url: data.publicUrl,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Unable to upload file" },
      { status: 500 }
    );
  }
}
