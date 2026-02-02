import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://13.60.162.82:3000";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { path } = await context.params;

    const url = `${BACKEND_URL}/${path.join("/")}${
      req.nextUrl.search ? `?${req.nextUrl.searchParams.toString()}` : ""
    }`;

    console.log("Proxying GET request to:", url);

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.text();

    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy GET error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { path } = await context.params;
    const body = await req.text();

    const url = `${BACKEND_URL}/${path.join("/")}`;

    console.log("Proxying POST request to:", url);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": req.headers.get("content-type") || "application/json",
      },
      body,
    });

    const data = await res.text();

    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy POST error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request" },
      { status: 500 }
    );
  }
}