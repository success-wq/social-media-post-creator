import { NextRequest, NextResponse } from "next/server";

export async function proxyJsonPost(req: NextRequest, upstream: string | undefined) {
  if (!upstream) {
    return NextResponse.json({ error: "Upstream URL not configured" }, { status: 500 });
  }

  let bodyText: string;
  try {
    bodyText = await req.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(upstream, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: bodyText,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Upstream request failed", detail: (err as Error).message },
      { status: 502 },
    );
  }

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
    },
  });
}

export async function proxyGet(upstream: string | undefined) {
  if (!upstream) {
    return NextResponse.json({ error: "Upstream URL not configured" }, { status: 500 });
  }

  let res: Response;
  try {
    res = await fetch(upstream, { method: "GET", redirect: "follow" });
  } catch (err) {
    return NextResponse.json(
      { error: "Upstream request failed", detail: (err as Error).message },
      { status: 502 },
    );
  }

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
    },
  });
}
