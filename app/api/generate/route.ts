import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const action: string = body?.action;
  if (!action) return NextResponse.json({ error: "action required" }, { status: 400 });

  // Dispatch to specific handlers. Keep implementations small; expand as needed.
  switch (action) {
    case "generate-diagram":
      // forward to engineering generate endpoint
      return await fetch(`${request.nextUrl.origin}/api/engineering/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body.config ? body : { config: body }),
      }).then(async (r) => {
        const data = await r.json().catch(() => ({}));
        return NextResponse.json(data, { status: r.status });
      }).catch((e) => {
        return NextResponse.json({ error: e.message }, { status: 500 });
      });

    // future actions: stubs
    case "generate-icon":
    case "generate-logo":
    case "generate-flowchart":
    case "generate-floorplan":
    case "generate-presentation":
    case "generate-brand":
    case "generate-dataset":
    case "generate-receipt":
    case "generate-document":
    case "generate-UI":
    case "generate-avatar":
      // For now return a stub indicating the action is recognized
      return NextResponse.json({ message: `Action ${action} recognized; implementation pending.` });

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
