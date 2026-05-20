import { proxyGet } from "@/lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return proxyGet(process.env.SHEETS_WEBAPP_URL);
}
