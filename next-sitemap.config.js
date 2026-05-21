/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://nomadshield-engine.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ['/server-sitemap.xml'], // Exclude dynamic sitemap if generated separately
  robotsTxtOptions: {
    additionalSitemaps: [
      `${process.env.SITE_URL || 'https://nomadshield-engine.vercel.app'}/sitemap.xml`,
    ],
  },
}
