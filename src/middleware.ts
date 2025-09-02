import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token");
    const { pathname } = req.nextUrl;

    if(pathname.startsWith("/dashboard") && !token) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if(pathname === '/' &&  token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/dashboard/:path*"
    ],
}