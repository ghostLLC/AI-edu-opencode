import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale } from './config';

function pickLocale(requested: string | undefined): Locale {
  if (requested && (routing.locales as readonly string[]).includes(requested)) {
    return requested as Locale;
  }
  return routing.defaultLocale;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = pickLocale(requested);

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
