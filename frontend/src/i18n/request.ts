import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ locale }) => {
    const resolvedLocale = locale && ['en', 'zh-TW'].includes(locale) ? locale : 'zh-TW';
    return {
        locale: resolvedLocale,
        messages: (await import(`../../messages/${resolvedLocale}.json`)).default
    };
});

