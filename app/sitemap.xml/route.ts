export async function GET() {
  const baseUrl = "https://ecoutertranscribe.tech"

  const routes = ["", "/login", "/signup", "/transcribe", "/demo"]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map(
      (route) => `
    <url>
      <loc>${baseUrl}${route}</loc>
      <changefreq>monthly</changefreq>
      <priority>${route === "/" ? "1.0" : "0.8"}</priority>
    </url>`
    )
    .join("")}
</urlset>`

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
