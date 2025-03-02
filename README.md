## Google Drive Assets Downloader

This project provides a simple application to download assets from a publicly shared Google Drive to a local folder.

### Local Setup

Follow these steps to set up the project on your system.

### Repository Structure

This is a **monorepo**, meaning it contains both the frontend and backend in a single repository.

---

### **Frontend Setup**

1. Navigate to the frontend directory:
   ```sh
   cd Frontend
   ```
2. Install dependencies:
   ```sh
   npm install

   ```
3. Run the frontend locally:
   ```sh
   npm run dev
   ```
4. Create a .env file in the frontend directory and set the following variables:
   ```sh
   VITE_BACKEND_URL=<your_backend_url>
   VITE_SOCKET_URL=<your_backend_socket_url>

   ```

### **Server Setup**

1. Navigate to the backend directory:
   ```sh
   cd server
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a .env file in the backend directory and set the following variables:
   ```sh
   GOOGLE_API_KEY=<your_google_api_key>
   FRONTEND_URL=<your_local_frontend_url>
   ```

- GOOGLE_API_KEY: Obtain this from the Google Developer Console.
- FRONTEND_URL: The local development URL of your frontend.

4. Start the backend server:
   ```sh
   node index.js

   ```

- Or, if you have nodemon installed (it restarts the server on file changes):
  ```sh
  nodemon index.js


  ```

## **Thank You for Stopping By! 🚀**
