require("dotenv").config();
const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");
const fs = require("fs");
const path = require('path')
const http = require("http");

const { extractFolderId, fetchDriveFiles, downloadFile } = require("./utils");

const app = express();
const PORT = process.env.port || 8080;
const server = http.createServer(app);


const BASE_DOWNLOAD_FOLDER = path.join(__dirname, "public", "assets");

const FRONTEND_URL = process.env.FRONTEND_URL

app.use(express.json());
app.use(cors({
  origin: [FRONTEND_URL],
})
);
// app.use(cors());
// this will server static assets when called from ui
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));



// WebSocket Server
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("Received:", message);
  });

  ws.on("close", () => console.log("Client disconnected"));
});



//  Endpoint to return paginated files from a folder
app.get("/api/assets/:folderId", (req, res) => {
  const { folderId } = req.params;
  let { page, limit } = req.query;

  if (!folderId) {
    return res.status(400).json({ error: "Folder ID is required" });
  }

  // Convert query params to integers with defaults
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  if (page < 1 || limit < 1) {
    return res.status(400).json({ error: "Page and limit must be positive integers." });
  }

  // Folder path where files are stored
  const folderPath = path.join(__dirname, "public", "assets", folderId);

  // Check if folder exists
  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ error: "Folder not found" });
  }

  // Read all files in the folder dynamically
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Error reading directory" });
    }


    // sort files by creation as we are storing files in the folder in background by download process
    files = files.map(file => ({
      name: file,
      url: `${process.env.BACKEND_URL}/assets/${folderId}/${file}`,
      createdAt: fs.statSync(path.join(folderPath, file)).birthtime
    })).sort((a, b) => a.createdAt - b.createdAt); // Oldest first

    // Implement pagination
    const totalFiles = files.length;
    const totalPages = Math.ceil(totalFiles / limit);
    const startIndex = (page - 1) * limit; // if we are at page 2, this means 10 files are already delivered
    const paginatedFiles = files.slice(startIndex, startIndex + limit);

    res.json({
      page,
      limit,
      totalFiles,
      totalPages,
      paginatedFiles
    });
  });
});




// endpoint to download files from google drive and send progress updates
app.post("/api/submit", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Invalid URL" });

  const folderId = extractFolderId(url);
  if (!folderId) return res.status(400).json({ error: "Invalid Google Drive URL" });

  const files = await fetchDriveFiles(folderId);

  const DOWNLOAD_FOLDER = path.join(BASE_DOWNLOAD_FOLDER, folderId);
  if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER, { recursive: true });
  }

  // keep track of total files and completed files
  const totalFiles = files.length;
  let completedFiles = 0;
  files.forEach((file) => {
    // Download only images and videos
    //TODO: need to store the identifier for current user/client there can be multiple clients connected
    if (file.mimeType.startsWith("image/") || file.mimeType.startsWith("video/")) {
      downloadFile(DOWNLOAD_FOLDER, folderId, file, (progressData) => {
        completedFiles++;
        wss?.clients?.forEach((client) => {
          const { id, name, url, error, mimeType, isError } = progressData;
          const file = { id, name, url, mimeType };
          client.send(JSON.stringify({ totalFiles, completedFiles, folderId, file, error, isError }));
        });
      });
    }
  });

  res.json({ message: "Download process started!" });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} `));
