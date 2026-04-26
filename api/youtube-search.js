module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  var query = req.query.q;
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "Missing search query" });
  }

  var apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "YOUTUBE_API_KEY not set in Vercel environment variables." });
  }

  try {
    var url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("videoEmbeddable", "true");
    url.searchParams.set("safeSearch", "none");
    url.searchParams.set("maxResults", "12");
    url.searchParams.set("q", query.trim());
    url.searchParams.set("key", apiKey);

    var upstream = await fetch(url.toString());
    var data = await upstream.json();

    if (!upstream.ok) {
      var message = (data && data.error && data.error.message) || "YouTube API error";
      var reason = (data && data.error && data.error.errors && data.error.errors[0] && data.error.errors[0].reason) || "";
      return res.status(upstream.status).json({ error: message, reason: reason });
    }

    var results = (data.items || []).map(function(item) {
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumb: (item.snippet.thumbnails && item.snippet.thumbnails.medium && item.snippet.thumbnails.medium.url) ||
               (item.snippet.thumbnails && item.snippet.thumbnails.default && item.snippet.thumbnails.default.url) || ""
      };
    });

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json({ results: results });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
};
