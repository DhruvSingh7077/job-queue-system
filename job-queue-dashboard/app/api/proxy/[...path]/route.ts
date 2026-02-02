import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://13.60.162.82:3000";

export async function GET(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  const { path } = context.params;

  const url =
    `${BACKEND_URL}/${path.join("/")}` +
    (req.nextUrl.search ? `?${req.nextUrl.searchParams.toString()}` : "");

  const res = await fetch(url);

  const data = await res.text();

  return new NextResponse(data, {
    status: res.status,
    headers: {
      "Content-Type":
        res.headers.get("content-type") || "application/json",
    },
  });
}

export async function POST(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  const { path } = context.params;

  const body = await req.text();

  const res = await fetch(`${BACKEND_URL}/${path.join("/")}`, {
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
      "Content-Type":
        res.headers.get("content-type") || "application/json",
    },
  });
}
