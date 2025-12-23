import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'zh-TW', 'zh'],

    // Used when no locale matches
    defaultLocale: 'zh-TW'
});

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(zh-TW|en|zh)/:path*']
};
