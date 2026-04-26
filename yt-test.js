module.exports = function(req, res) {
res.setHeader(“Content-Type”, “text/html”);
res.status(200).send(`<!DOCTYPE html>

<html>
<head>
  <meta charset="UTF-8">
  <title>YT API Test</title>
  <style>
    body { font-family: monospace; background: #111; color: #eee; padding: 20px; }
    #log { background: #000; padding: 12px; border-radius: 8px; margin-top: 16px; min-height: 200px; white-space: pre-wrap; font-size: 13px; line-height: 1.6; }
    button { margin: 6px 4px; padding: 10px 16px; background: #1db954; border: 0; border-radius: 8px; color: #000; font-weight: bold; cursor: pointer; }
    button.s { background: #333; color: #eee; }
    #player { margin-top: 16px; }
  </style>
</head>
<body>
  <h2>YouTube IFrame API — Live Test</h2>
  <div>
    <button onclick="loadFirst()">Load Video 1 (Rick Astley)</button>
    <button onclick="loadSecond()">Load Video 2 (Bohemian Rhapsody)</button>
    <button class="s" onclick="doPlay()">playVideo()</button>
    <button class="s" onclick="doPause()">pauseVideo()</button>
    <button class="s" onclick="logState()">Log State</button>
  </div>
  <div id="player"></div>
  <div id="log">Waiting for API...
</div>
  <script>
    var player = null;
    var log = document.getElementById("log");
    function l(msg) {
      log.textContent += new Date().toISOString().slice(11,23) + "  " + msg + "\\n";
      log.scrollTop = log.scrollHeight;
    }
    window.onYouTubeIframeAPIReady = function() {
      l("onYouTubeIframeAPIReady fired — creating player...");
      player = new YT.Player("player", {
        height: "270", width: "480", videoId: "dQw4w9WgXcQ",
        playerVars: { autoplay: 1, playsinline: 1, controls: 1, rel: 0, origin: location.origin },
        events: {
          onReady: function(e) { l("onReady fired — calling playVideo()"); e.target.playVideo(); },
          onStateChange: function(e) {
            var states = {"-1":"UNSTARTED","0":"ENDED","1":"PLAYING","2":"PAUSED","3":"BUFFERING","5":"CUED"};
            l("onStateChange: " + (states[e.data] || e.data));
            if (e.data === 1) l("  duration=" + player.getDuration() + "s  time=" + player.getCurrentTime() + "s");
          },
          onError: function(e) {
            var codes = {2:"Invalid video ID",5:"HTML5 error",100:"Not found/private",101:"Embedding blocked",150:"Embedding blocked"};
            l("onError: code=" + e.data + " — " + (codes[e.data] || "unknown"));
          }
        }
      });
      l("YT.Player object created");
    };
    function loadFirst()  { if (!player) return l("No player"); l("loadVideoById: Rick Astley"); player.loadVideoById({videoId:"dQw4w9WgXcQ",startSeconds:0}); }
    function loadSecond() { if (!player) return l("No player"); l("loadVideoById: Bohemian Rhapsody"); player.loadVideoById({videoId:"tgbNymZ7vqY",startSeconds:0}); }
    function doPlay()  { if (player) { player.playVideo();  l("playVideo() called"); } }
    function doPause() { if (player) { player.pauseVideo(); l("pauseVideo() called"); } }
    function logState() {
      if (!player) return l("No player");
      var states = {"-1":"UNSTARTED","0":"ENDED","1":"PLAYING","2":"PAUSED","3":"BUFFERING","5":"CUED"};
      l("State=" + (states[player.getPlayerState()] || player.getPlayerState()) + "  duration=" + player.getDuration() + "  time=" + player.getCurrentTime());
    }
  </script>
  <script src="https://www.youtube.com/iframe_api"></script>
</body>
</html>`);
};
