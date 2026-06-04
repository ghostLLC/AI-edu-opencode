import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/lib/i18n/config';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PREFIXES = ['/dashboard', '/plans', '/intake', '/settings'];
const AUTH_PREFIXES = ['/sign-in', '/sign-up'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 提取 locale(如有)
  const pathnameWithoutLocale = stripLocale(pathname);
  const isProtected = PROTECTED_PREFIXES.some((p) => pathnameWithoutLocale.startsWith(p));
  const isAuthPage = AUTH_PREFIXES.some((p) => pathnameWithoutLocale.startsWith(p));

  // 鉴权
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (isProtected && !token) {
    const locale = pathname.split('/')[1] || routing.defaultLocale;
    const signInUrl = new URL(`/${locale}/sign-in`, req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthPage && token) {
    const locale = pathname.split('/')[1] || routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  // 走 i18n 中间件
  return intlMiddleware(req);
}

function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
    if (pathname === `/${locale}`) {
      return '/';
    }
  }
  return pathname;
}

export const config = {
  // 匹配所有路径除了 API、_next 静态资源、public
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
