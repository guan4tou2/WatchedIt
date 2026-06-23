import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'zh-TW', 'zh'],

    // Used when no locale matches
    defaultLocale: 'zh-TW'
});

const DEFAULT_LOCALE = 'zh-TW';
const LOCALES = ['en', 'zh-TW', 'zh'] as const;
const ROOT_DEVELOPMENT_ROUTES = new Set([
    '/episode-test',
    '/local-test',
    '/reminders',
    '/test',
    '/test-anilist',
    '/test-config',
    '/test-demo',
    '/test-download',
    '/test-indexeddb',
    '/test-pwa',
    '/test-reminder',
    '/test-sample-data',
    '/test-sorting',
    '/test-theme',
]);

const normalizePathname = (pathname: string) => {
    if (pathname.length > 1 && pathname.endsWith('/')) {
        return pathname.slice(0, -1);
    }

    return pathname;
};

const getLocaleFromDevelopmentRoute = (pathname: string) => {
    const segments = pathname.split('/');
    const possibleLocale = segments[1];

    return LOCALES.includes(possibleLocale as (typeof LOCALES)[number])
        ? possibleLocale
        : DEFAULT_LOCALE;
};

export const isDevelopmentOnlyRoute = (pathname: string) => {
    const normalizedPathname = normalizePathname(pathname);

    return (
        ROOT_DEVELOPMENT_ROUTES.has(normalizedPathname) ||
        LOCALES.some((locale) => normalizedPathname === `/${locale}/debug-init`)
    );
};

export default function middleware(request: NextRequest) {
    if (isDevelopmentOnlyRoute(request.nextUrl.pathname)) {
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.redirect(
                new URL(`/${getLocaleFromDevelopmentRoute(request.nextUrl.pathname)}`, request.url)
            );
        }

        return NextResponse.next();
    }

    return intlMiddleware(request);
}

export const config = {
    // Match internationalized pathnames plus development-only top-level pages
    // so production can keep debug/test tools out of the user-facing surface.
    matcher: [
        '/',
        '/(zh-TW|en|zh)/:path*',
        '/episode-test',
        '/local-test',
        '/reminders',
        '/test',
        '/test-anilist',
        '/test-config',
        '/test-demo',
        '/test-download',
        '/test-indexeddb',
        '/test-pwa',
        '/test-reminder',
        '/test-sample-data',
        '/test-sorting',
        '/test-theme',
    ]
};
