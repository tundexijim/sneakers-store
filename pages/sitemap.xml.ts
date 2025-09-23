// pages/sitemap.xml.ts
import { GetServerSideProps } from "next";
import { getAllProductsForSitemap } from "@/services/productService";

function generateSiteMap(products: any[]) {
  const baseUrl = "https://dtwears.ng";
  const currentDate = new Date().toISOString().split("T")[0];

  // Static pages
  const staticPages = [
    { path: "", priority: "1.0" },
    { path: "AboutUs", priority: "0.8" },
    { path: "contact", priority: "0.7" },
    { path: "products", priority: "0.9" },
  ];

  const staticUrls = staticPages.map(({ path, priority }) => {
    const url = path ? `${baseUrl}/${path}` : baseUrl;
    return `    <url>
      <loc>${url}</loc>
      <lastmod>${currentDate}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${priority}</priority>
    </url>`;
  });

  const productUrls = products.map((p) => {
    const lastmod = p.updatedAt
      ? p.updatedAt instanceof Date
        ? p.updatedAt.toISOString().split("T")[0]
        : new Date(p.updatedAt).toISOString().split("T")[0]
      : currentDate;

    return `    <url>
      <loc>${baseUrl}/products/${p.slug}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>`;
  });

  const allUrls = [...staticUrls, ...productUrls];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.join("\n")}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    // Handle the case where getAllProductsForSitemap returns an object with products property
    const result = await getAllProductsForSitemap();
    const products = result.products || result; // Handle both formats

    const sitemap = generateSiteMap(products);

    res.setHeader("Content-Type", "application/xml");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate"
    );
    res.write(sitemap);
    res.end();

    return { props: {} };
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Return a minimal sitemap on error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dtwears.ng/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.write(fallbackSitemap);
    res.end();

    return { props: {} };
  }
};

export default function SiteMap() {
  return null;
}
