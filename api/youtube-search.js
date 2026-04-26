// api/youtube-search.js — Vercel serverless function
// Keeps your YouTube Data API key server-side only.
// Deploy to Vercel and set YOUTUBE_API_KEY in your project’s Environment Variables.

export default async function handler(req, res) {
// Only allow GET requests
if (req.method !== “GET”) {
return res.status(405).json({ error: “Method not allowed” });
}

const query = req.query.q;
if (!query || typeof query !== “string” || query.trim().length === 0) {
return res.status(400).json({ error: “Missing search query” });
}

const apiKey = process.env.YOUTUBE_API_KEY;
if (!apiKey) {
return res.status(500).json({ error: “YouTube API key not configured on server. Add YOUTUBE_API_KEY in Vercel dashboard → Settings → Environment Variables.” });
}

try {
const url = new URL(“https://www.googleapis.com/youtube/v3/search”);
url.searchParams.set(“part”, “snippet”);
url.searchParams.set(“type”, “video”);
url.searchParams.set(“videoEmbeddable”, “true”);
url.searchParams.set(“safeSearch”, “none”);
url.searchParams.set(“maxResults”, “12”);
url.searchParams.set(“q”, query.trim());
url.searchParams.set(“key”, apiKey);

```
const upstream = await fetch(url.toString());
const data = await upstream.json();

if (!upstream.ok) {
  const message = data?.error?.message || "YouTube API error";
  return res.status(upstream.status).json({ error: message });
}

const results = (data.items || []).map(item => ({
  id: item.id.videoId,
  title: item.snippet.title,
  channel: item.snippet.channelTitle,
  thumb:
    item.snippet.thumbnails?.medium?.url ||
    item.snippet.thumbnails?.default?.url ||
    "",
}));

// Cache for 5 minutes at the CDN edge
res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
return res.status(200).json({ results });
```

} catch (err) {
return res.status(500).json({ error: “Internal server error: “ + err.message });
}
}
