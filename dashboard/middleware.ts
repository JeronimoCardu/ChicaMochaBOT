import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PREFIXES = ["/login", "/api/auth", "/api/cron", "/privacy", "/terms", "/data-deletion"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

// SHA-256 usando Web Crypto API (compatible con Edge Runtime)
async function sha256hex(value: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(req: NextRequest) {
  if (isPublic(req.nextUrl.pathname)) return NextResponse.next();

  const pw = process.env.DASHBOARD_PASSWORD;
  if (!pw) {
    return new NextResponse(
      "DASHBOARD_PASSWORD no configurado en variables de entorno.",
      { status: 503 }
    );
  }

  const token    = req.cookies.get("auth_token")?.value;
  const expected = await sha256hex(pw);

  if (token !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
