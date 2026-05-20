import { NextRequest } from "next/server";
import { proxyJsonPost } from "@/lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  return proxyJsonPost(req, process.env.N8N_IMAGE_WEBHOOK);
}
