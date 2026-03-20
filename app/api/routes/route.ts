import { NextRequest, NextResponse } from "next/server";

// Database functionality disabled - routes are not persisted
// All route generation happens on the client side

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { coordinates, distance } = body;

    if (!coordinates || !distance) {
      return NextResponse.json(
        { error: "coordinates and distance are required" },
        { status: 400 },
      );
    }

    // Return success without saving (database disabled)
    return NextResponse.json({
      success: true,
      message: "Route received (not persisted - database disabled)"
    });
  } catch (error) {
    console.error("Error processing route:", error);
    return NextResponse.json(
      { error: "Failed to process route" },
      { status: 500 },
    );
  }
}
