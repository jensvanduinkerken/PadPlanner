import { NextRequest, NextResponse } from "next/server";

// Database functionality disabled - route fetching not available
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    return NextResponse.json(
      {
        error: "Route sharing disabled - database functionality not enabled",
        message: "Routes are generated on-demand and not persisted"
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
