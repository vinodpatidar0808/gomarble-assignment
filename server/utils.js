const axios = require("axios");
const fs = require('fs')
const path = require('path');
require("dotenv").config();


// Google api limits number of request, which fails the download process, so created multiple keys which will be used in a round robin fashion
const GOOGLE_API_KEYS = [process.env.GOOGLE_API_KEYprocess.env.GOOGLE_API_KEY_1, process.env.GOOGLE_API_KEY_2, process.env.GOOGLE_API_KEY_3 ];
let counter = 0;
const totalKeys = 4; // when using only one key, set this to 1


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

// downloads file from google drive and saves it to provided folder, downloads from drive with api key, less reliable
const downloadFile = async (DOWNLOAD_FOLDER, folderId, file, callback) => {
  const { id, name, mimeType } = file;
  // this will only work for folder which are publicly shared, downloading content of private folder will require authentication token from user

  const apiKey = GOOGLE_API_KEYS[counter % totalKeys];
  counter++;

  const fileUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&fields=id,name,mimeType&key=${apiKey}`
  const filePath = path.join(DOWNLOAD_FOLDER, name);
  try {

    if (!fs.existsSync(filePath)) {
      const response = await axios({
        url: fileUrl,
        method: "GET",
        // headers: {
        //   'Accept': 'application/json',
        //   'Authorization': `Bearer ${apiKey}`
        // },
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          // TODO: check filepath after deploying 
          callback({ id: id, name: name, mimeType: mimeType, url: `${process.env.BACKEND_URL}/assets/${folderId}/${name}`, error: null, isError: false });
          resolve(name);
        });
        writer.on("error", reject);
      });
    } else {
      callback({ id: id, name: name, mimeType: mimeType, url: `${process.env.BACKEND_URL}/assets/${folderId}/${name}`, error: null, isError: false });
    }
  } catch (error) {
    console.error(`Error downloading ${name}:`, error.message);
    callback({ id: id, name: name, mimeType: mimeType, error: error.message, isError: true });
    return null;
  }
};







// TODO: experiment with this approach  to download files from google drive using OAuth2.0.
// const downloadFileWithOAuth = async (DOWNLOAD_FOLDER, folderId, file, callback) => {
//   const { id, name, mimeType } = file;
//   try {
//     // Get authenticated client
//     const auth = getAuthClientFromEnv();

//     // Create Drive client
//     const drive = google.drive({ version: 'v3', auth });


//     // Get file metadata
//     // const fileMetadata = await drive.files.get({
//     //   fileId: id,
//     //   fields: 'name, mimeType, size'
//     // });

//     // console.log(`Downloading file: ${fileMetadata.data.name}, Size: ${fileMetadata.data.size} bytes`);

//     // Set destination path
//     // let finalDestinationPath = destinationPath;
//     // if (fs.existsSync(destinationPath) && fs.lstatSync(destinationPath).isDirectory()) {
//     //   finalDestinationPath = path.join(destinationPath, fileMetadata.data.name);
//     // }

//     // // Create directory if needed
//     // const dir = path.dirname(finalDestinationPath);
//     // if (!fs.existsSync(dir)) {
//     //   fs.mkdirSync(dir, { recursive: true });
//     // }

//     // Download the file
//     const response = await drive.files.get(
//       { fileId: id, alt: 'media' },
//       { responseType: 'stream' }
//     );
//     const filePath = path.join(DOWNLOAD_FOLDER, name);
//     console.log("file path: ", filePath)
//     try {

//       console.log("fs.exists: ", fs.existsSync(filePath))
//       if (!fs.existsSync(filePath)) {
//         // const response = await axios({
//         //   url: fileUrl,
//         //   method: "GET",
//         //   responseType: "stream"
//         // });
//         const response = await drive.files.get(
//           { fileId: id, alt: 'media' },
//           { responseType: 'stream' }
//         );
//         console.log("response: ", response)

//         const writer = fs.createWriteStream(filePath);
//         response.data.pipe(writer);
//         return new Promise((resolve, reject) => {
//           writer.on("finish", () => {
//             // TODO: check filepath after deploying 
//             callback({ id: id, name: name, mimeType: mimeType, url: `assets/${folderId}/${name}` });
//             resolve(name);
//           });
//           writer.on("error", reject);
//         });
//       } else {
//         // TODO: check file path after deploying
//         callback({ id: id, name: name, mimeType: mimeType, url: `${process.env.BACKEND_URL}/assets/${folderId}/${name}` });
//       }
//     } catch (error) {
//       console.log("error: ", error)
//       console.error(`Error downloading ${name}:`, error.message);
//       return null;
//     }

//     // Save the file
//     // return new Promise((resolve, reject) => {
//     //   const dest = fs.createWriteStream(finalDestinationPath);

//     //   response.data
//     //     .on('end', () => {
//     //       console.log('Download complete!');
//     //       resolve(finalDestinationPath);
//     //     })
//     //     .on('error', err => {
//     //       console.error('Error downloading file:', err);
//     //       reject(err);
//     //     })
//     //     .pipe(dest);
//     // });
//   } catch (error) {
//     console.error('Error in OAuth download process:', error.message);
//     throw error;
//   }
// }


// function getAuthClientFromEnv() {
//   // Check if required environment variables are set
//   const requiredVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
//   const missingVars = requiredVars.filter(varName => !process.env[varName]);

//   if (missingVars.length > 0) {
//     throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
//   }

//   // Create OAuth client
//   const oAuth2Client = new OAuth2Client(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/oauth2callback'
//   );

//   // Set credentials using refresh token
//   oAuth2Client.setCredentials({
//     refresh_token: process.env.GOOGLE_REFRESH_TOKEN
//   });

//   return oAuth2Client;
// }

module.exports = { extractFolderId, fetchDriveFiles, downloadFile };