import { NextRequest, NextResponse } from "next/server";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { getSessionUser } from "@/lib/session";
import { isStaff } from "@/lib/auth";

/**
 * Streams PRIVATE enquiry attachments from data/uploads.
 * Files are never exposed through the public directory.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const user = await getSessionUser();
  if (!user || !isStaff(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: parts } = await params;
  const relative = parts.join("/");
  if (relative.includes("..")) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  const base = path.join(process.cwd(), "data", "uploads");
  const filePath = path.join(base, relative);
  if (!filePath.startsWith(base) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const stream = createReadStream(filePath);
  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${path.basename(filePath)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
