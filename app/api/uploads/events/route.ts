import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-auth";
import { saveUploadedEventImages } from "@/lib/server-uploads";

export async function POST(request: Request) {
  const adminUser = await requireAdminRequest(request);

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!files.length) {
    return NextResponse.json(
      { error: "Select at least one image to upload." },
      { status: 400 },
    );
  }

  try {
    const uploadedFiles = await saveUploadedEventImages(files);
    return NextResponse.json({ files: uploadedFiles }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload images.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
