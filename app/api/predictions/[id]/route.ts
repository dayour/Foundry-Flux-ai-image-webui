import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";

import { queryGeneration } from "@/models/generation";

export async function GET(request: Request, { params }: { params: { id?: string } }) {
  noStore();

  const predictionId = params?.id;
  const searchParams = new URL(request.url).searchParams;
  const dataId = searchParams.get("pid");

  if (!predictionId) {
    return NextResponse.json(
      { error: "Prediction id is required" },
      { status: 400 }
    );
  }

  if (!dataId) {
    return NextResponse.json(
      {
        id: predictionId,
        status: "processing",
      },
      { status: 200 }
    );
  }

  const generation = await queryGeneration({ id: dataId });

  if (!generation?.id) {
    return NextResponse.json(
      {
        id: predictionId,
        dataId,
        status: "processing",
      },
      { status: 200 }
    );
  }

  const outputUrl = generation.generation || generation.imgUrl || null;

  return NextResponse.json(
    {
      id: predictionId,
      dataId: generation.id,
      status: outputUrl ? "succeeded" : "processing",
      output: outputUrl,
    },
    { status: 200 }
  );
}
