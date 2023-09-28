/**
 * @type {import('next').NextConfig}
 */
const isProd = process.env.NODE_ENV === 'production'

console.log("isProd " + isProd);

module.exports = {
  // Use the CDN in production and localhost for development.
  // assetPrefix: isProd ? 'https://wanghalan.github.io/next' : undefined,
  // https://nextjs.org/docs/app/api-reference/next-config-js/basePath
  basePath: isProd ? '/usd3' : undefined,
  output: 'export',
   
  // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
  // trailingSlash: true,
 
  // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
  // skipTrailingSlashRedirect: true,
 
  // Optional: Change the output directory `out` -> `dist`
  // distDir: 'dist',
  // Ref: https://github.com/vercel/next.js/issues/19711
  images: {
      unoptimized: true
  }
}
