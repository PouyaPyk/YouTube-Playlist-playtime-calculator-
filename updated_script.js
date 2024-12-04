
document.getElementById("calculate-btn").addEventListener("click", async function () {
    const playlistURL = document.getElementById("playlist-url").value;

    if (!playlistURL.includes("list=")) {
        document.getElementById("result").innerText = "Invalid YouTube playlist link.";
        return;
    }

    const playlistId = playlistURL.split("list=")[1];
    const apiKey = "AIzaSyDNHp_6xDY4h4ScxTTRJzRU0qf4OrDPIzk"; // Replace with your YouTube Data API key
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;

    try {
        let totalDuration = 0;
        let nextPageToken = "";

        // Fetch playlist data and accumulate durations
        do {
            const response = await fetch(nextPageToken ? `${apiUrl}&pageToken=${nextPageToken}` : apiUrl);
            const data = await response.json();

            if (data.error) {
                document.getElementById("result").innerText = `Error: ${data.error.message}`;
                return;
            }

            nextPageToken = data.nextPageToken;
            const videoIds = data.items.map(item => item.contentDetails.videoId);

            // Fetch video details
            const videoResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(
                    ","
                )}&key=${apiKey}`
            );
            const videoData = await videoResponse.json();

            videoData.items.forEach(video => {
                const duration = parseDuration(video.contentDetails.duration);
                totalDuration += duration;
            });
        } while (nextPageToken);

        const averageDuration = totalDuration / (data.items.length || 1);
        document.getElementById("result").innerText = `Total Duration: ${formatDuration(
            totalDuration
        )}\nAverage Duration: ${formatDuration(averageDuration)}`;
    } catch (error) {
        console.error(error);
        document.getElementById("result").innerText = "An error occurred. Please try again.";
    }
});

// Parse ISO 8601 duration
function parseDuration(duration) {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);
    const hours = parseInt(matches[1] || "0");
    const minutes = parseInt(matches[2] || "0");
    const seconds = parseInt(matches[3] || "0");
    return hours * 3600 + minutes * 60 + seconds;
}

// Format seconds to HH:MM:SS
function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
}
