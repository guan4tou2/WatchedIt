import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ locale }) => {
    const supportedLocales = ['en', 'zh-TW', 'zh'];
    const resolvedLocale = locale && supportedLocales.includes(locale) ? locale : 'zh-TW';
    // If the locale is 'zh', we want to load 'zh-TW.json' as a fallback
    const messageFile = resolvedLocale === 'zh' ? 'zh-TW' : resolvedLocale;
    return {
        locale: resolvedLocale,
        messages: (await import(`../../messages/${messageFile}.json`)).default
    };
});

