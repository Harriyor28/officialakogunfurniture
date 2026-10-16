import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { isStaff } from "@/lib/auth";
import { savePublicImage } from "@/lib/upload";
import { audit } from "@/lib/audit";

/** Staff-only image upload used by admin forms. */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isStaff(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const saved = await savePublicImage(file);
  if (!saved) {
    return NextResponse.json(
      { error: "Unsupported file type or file too large (max 8MB images: jpg, png, webp, avif, svg; max 40MB videos: mp4, webm)." },
      { status: 400 },
    );
  }

  await audit({ userId: user.id, action: "upload.image", entity: "Upload", entityId: saved.url });
  return NextResponse.json(saved);
}
