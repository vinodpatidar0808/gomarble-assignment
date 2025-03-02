import axios from "axios"
import { useState } from "react"
import { validDriveUrl } from "../utils"
import ProgressBar from "./Progressbar"

const Sidebar = ({ progress, setProgress, assetsRef }) => {
  const [url, setUrl] = useState("")
  const [ws, setWs] = useState(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (url) => {
    setLoading(true)
    try {
      if (ws) {
        ws.close()
      }
      assetsRef.current = []
      const socket = new WebSocket(import.meta.env.VITE_SOCKET_URL);

      socket.onopen = () => console.log("WebSocket connected");
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.file && !data.isError) {
          assetsRef.current.push(data.file)
          setProgress({
            completed: data.completedFiles,
            total: data.totalFiles
          });
          if (data.completedFiles === data.totalFiles) {
            // enable button and also close current websocket connection
            setLoading(false)
            socket.close()
          }
        } else if (data.isError) {
          setLoading(false)
          setError(data.error)
        }
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected")
        setLoading(false)
      };
      socket.onerror = (error) => console.error("WebSocket error:", error);
      setWs(socket);

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/submit`, { url })
    } catch (error) {
      console.log(error)
    }

  }

  const handleChange = (e) => {
    setUrl(e.target.value)
  }

  return (
    <div className="sidebar">
      <label className="block text-sm font-medium text-gray-700">Paste Google Drive Folder URL:</label>
      <textarea
        className="input"
        rows="3"
        placeholder="Paste your Google Drive folder URL here..."
        value={url}
        onChange={handleChange}
      ></textarea>
      <button disabled={(!validDriveUrl(url) || loading)} className="button" onClick={() => handleSubmit(url)}>Send</button>
      <ProgressBar completed={progress.completed ?? 0} total={progress.total ?? 0} />
      {error && <p style={{ color: "red" }}>Failed to download file from drive, {error}</p>}
    </div>
  )
}

export default Sidebar