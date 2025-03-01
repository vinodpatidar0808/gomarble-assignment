const axios = require("axios");
const { assert } = require("console");
const fs = require('fs')
const path = require('path')
require("dotenv").config();

// const DOWNLOAD_FOLDER = path.join(__dirname, "public", "assets");


// extract folder id from provided google drive url, if invalid url returns null
const extractFolderId = (url) => {
  const match = url.match(/(?:folders\/|id=)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

// fetches files from google drive based on folder id extracted from the url.
const fetchDriveFiles = async (folderId) => {
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${process.env.GOOGLE_API_KEY}&fields=files(id,name,mimeType,webContentLink,thumbnailLink,size,hasThumbnail)`;

  try {
    // if there are many files, need to handle pagination here, but for now just fetch all
    const response = await axios.get(url);
    return response.data.files || [];
  } catch (error) {
    console.error("Error fetching files:", error.response?.data || error.message);
    return [];
  }
};




const downloadFile = async (DOWNLOAD_FOLDER, folderId, file, callback) => {
  const { id, name, mimeType } = file;
  // this will only work for folder which are publicly shared, downloading content of private folder will require authentication token from user

  const fileUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${process.env.GOOGLE_API_KEY}`
  const filePath = path.join(DOWNLOAD_FOLDER, name);
  try {

    if (!fs.existsSync(filePath)) {
      const response = await axios({
        url: fileUrl,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          // TODO: check filepath after deploying 
          callback({ id: id, name: name, mimeType: mimeType, url: `assets/${folderId}/${name}` });
          resolve(name);
        });
        writer.on("error", reject);
      });
    } else {
      // TODO: check file path after deploying
      callback({ id: id, name: name, mimeType: mimeType, url: `assets/${folderId}/${name}` });
    }
  } catch (error) {
    console.error(`Error downloading ${name}:`, error.message);
    return null;
  }
};


module.exports = { extractFolderId, fetchDriveFiles, downloadFile };