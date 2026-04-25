import type { AstroIntegration } from 'astro';

export default function indexNowSubmitter(apiKey: string, siteUrl: string): AstroIntegration {
  return {
    name: 'indexnow-submitter',
    hooks: {
      'astro:build:done': async ({ routes, logger }) => {
        logger.info('Preparing to ping IndexNow + Google...');

        // 1. Gather all generated paths
        const urls = routes
          .filter(route => route.type === 'page' && route.pathname)
          .map(route => {
            const pathName = route.pathname || '';
            const normalizedPath = pathName.startsWith('/') ? pathName : `/${pathName}`;
            return `${siteUrl}${normalizedPath}`;
          });

        if (urls.length === 0) {
          logger.info('No URLs found for submission.');
          return;
        }

        logger.info(`Found ${urls.length} URLs:`);
        urls.forEach(url => logger.info(`  → ${url}`));

        // 2. Submit to IndexNow API with retry logic
        const submitToIndexNow = async (attempt: number = 1): Promise<void> => {
          const maxRetries = 3;
          try {
            const host = new URL(siteUrl).host;
            const res = await fetch('https://api.indexnow.org/indexnow', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                host: host,
                key: apiKey,
                keyLocation: `${siteUrl}/${apiKey}.txt`,
                urlList: urls
              })
            });

            if (res.ok || res.status === 200 || res.status === 202) {
              logger.info(`✅ IndexNow: Successfully submitted ${urls.length} URLs (attempt ${attempt})`);
            } else if (attempt < maxRetries) {
              const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
              logger.warn(`⚠️ IndexNow: Attempt ${attempt} failed (${res.status} ${res.statusText}). Retrying in ${delay / 1000}s...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              return submitToIndexNow(attempt + 1);
            } else {
              logger.error(`❌ IndexNow: Failed after ${maxRetries} attempts. Last status: ${res.status} ${res.statusText}`);
            }
          } catch (error) {
            if (attempt < maxRetries) {
              const delay = Math.pow(2, attempt) * 1000;
              logger.warn(`⚠️ IndexNow: Network error on attempt ${attempt}. Retrying in ${delay / 1000}s...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              return submitToIndexNow(attempt + 1);
            } else {
              logger.error(`❌ IndexNow: Failed after ${maxRetries} attempts due to network error.`);
            }
          }
        };

        await submitToIndexNow();

        // Note: Google deprecated the /ping?sitemap= endpoint in June 2023.
        // Google discovers content via Search Console sitemaps + IndexNow (for Bing/Yandex).
        // For Google, the best approach is sitemap submission through Search Console.
        logger.info('ℹ️ Reminder: Submit sitemap via Google Search Console for Google indexing.');
      }
    }
  };
}
