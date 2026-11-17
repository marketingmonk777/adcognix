const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
/** Static export: hosts free on GitHub Pages / Cloudflare Pages. */
export default { output: 'export', basePath: base, trailingSlash: true, images: { unoptimized: true } };
