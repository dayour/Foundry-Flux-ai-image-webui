import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { svgUrl, format = "pdf" } = body as { svgUrl?: string; format?: string };
  if (!svgUrl) return NextResponse.json({ error: "svgUrl required" }, { status: 400 });

  const publicPath = path.join(process.cwd(), "public", svgUrl.replace(/^\//, ""));
  try {
    await fs.readFile(publicPath, "utf8");
    if (format === "pdf") {
      // placeholder: future PDF conversion can be handled here
      return NextResponse.json({ url: svgUrl });
    }

    if (format === "dxf") {
      // Placeholder: return svg path; actual conversion to DXF requires makerjs or third-party
      return NextResponse.json({ url: svgUrl });
    }

    return NextResponse.json({ url: svgUrl });
  } catch (e) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
