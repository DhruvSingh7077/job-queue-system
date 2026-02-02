import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://13.60.162.82:3000";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const url = `${BACKEND_URL}/${params.path.join("/")}${req.nextUrl.search}`;
  const res = await fetch(url);
  const data = await res.text();

  return new NextResponse(data, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const body = await req.text();

  const res = await fetch(
    `${BACKEND_URL}/${params.path.join("/")}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }
  );

  const data = await res.text();

  return new NextResponse(data, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  });
}
