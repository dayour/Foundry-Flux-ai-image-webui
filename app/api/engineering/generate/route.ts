import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { callAzureFluxImage } from "@/lib/azureFlux";
import { DiagramConfig } from "@/components/Generator/types";
import { z } from "zod";
import { isUnlimitedAccount } from "@/lib/unlimitedAccounts";

const DiagramConfigSchema = z.object({
  type: z.string(),
  category: z.string(),
  description: z.string().min(10),
  style: z.enum(["technical","schematic","blueprint","modern","minimal"]),
  annotations: z.boolean(),
  scale: z.string().optional(),
  units: z.enum(["metric","imperial"]).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const configPayload = body?.config ?? body;
  const validation = DiagramConfigSchema.safeParse(configPayload);
  if (!validation.success) return NextResponse.json({ error: "Invalid configuration", details: validation.error }, { status: 400 });

  const config: DiagramConfig = validation.data;
  const creditsRequired = 3;
  const isDevAccount = isUnlimitedAccount(session.user.email);

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, credits: true } });
  if (!user) {
    return NextResponse.json({ error: "User account not found" }, { status: 404 });
  }

  if (!isDevAccount && user.credits < creditsRequired) {
    return NextResponse.json({ error: "Insufficient credits", required: creditsRequired, available: user?.credits || 0 }, { status: 402 });
  }

  if (!isDevAccount) {
    await prisma.user.update({ where: { id: user.id }, data: { credits: { decrement: creditsRequired } } });
  }

  try {
    const prompt = buildDiagramPrompt(config);
    const fluxResponse = await callAzureFluxImage({
      prompt,
      style: config.style,
      width: 1216,
      height: 832,
      quality: "hd",
      responseFormat: "b64_json",
    });

    const imageUrl = fluxResponse.b64Json
      ? `data:image/png;base64,${fluxResponse.b64Json}`
      : fluxResponse.pngUrl || fluxResponse.primaryUrl;
    const svgUrl = fluxResponse.svgUrl || undefined;

    const diagram = await prisma.engineeringDiagram.create({ data: {
      userId: user.id,
      name: `${config.type} diagram`,
      type: config.type,
      category: config.category,
      description: config.description,
      config: JSON.stringify(config),
      elements: JSON.stringify(config.elements || []),
      annotations: JSON.stringify([]),
      imageUrl,
      svgUrl,
      tags: [config.category, config.type, config.style].join(',')
    }});

    return NextResponse.json({ id: diagram.id, imageUrl: diagram.imageUrl, svgUrl: diagram.svgUrl });

  } catch (error) {
    console.error("Diagram generation error:", error);
    if (!isDevAccount) {
      await prisma.user.update({ where: { id: user.id }, data: { credits: { increment: creditsRequired } } });
    }
    const message = error instanceof Error ? error.message : "Diagram generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildDiagramPrompt(config: DiagramConfig): string {
  const parts: string[] = [];
  parts.push(config.description);
  if (config.style === "technical") parts.push("technical drawing style, black and white, precise lines, engineering standard");
  else if (config.style === "schematic") parts.push("schematic diagram with standard symbols, clean lines, professional");
  else if (config.style === "blueprint") parts.push("blueprint style, blue background, white lines, architectural drawing");
  else if (config.style === "modern") parts.push("modern clean design, minimal colors, clear hierarchy");
  else if (config.style === "minimal") parts.push("minimalist diagram, simple shapes, monochrome");
  if (config.annotations) parts.push("with labels and annotations");
  parts.push("high precision, clear connections, professional quality");
  parts.push(`${config.type} diagram format`);
  // Enforce viewpoint / projection and format expectations
  const viewpoint = getViewpointInstructions(config.category, config.type);
  if (viewpoint) parts.push(viewpoint);
  if (config.units) parts.push(`Include dimensions and scale in ${config.units} units.`);
  return parts.join(", ");
}

// legacy placeholder removed; Azure Flux used via callAzureFluxImage

function getViewpointInstructions(category: string, type: string): string | null {
  if (category === 'architecture') {
    if (type === 'floorplan') return 'Top-down floorplan (orthographic), walls as thick lines, doors as arcs, room labels, and dimension lines.';
    if (type === 'isometric') return 'Isometric (3D) projection showing depth and elevation, not top-down.';
  }
  if (category === 'cad') {
    if (type === 'mechanical') return 'Orthographic projection (front/top/side) with precise dimensions and tolerances.';
  }
  if (category === 'network') return 'Top-down logical network diagram with standardized symbols and labeled links.';
  if (category === 'circuit') return 'Schematic circuit diagram using standard symbols, clear net labels, no perspective.';
  if (category === 'flowchart') return 'Flowchart layout with directional connectors and labeled decision nodes.';
  return null;
}

function escapeXml(s: string) { return s.replace(/[<>&'"\n]/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;","\"":"&quot;","\n":" "}[c] as string) ); }
