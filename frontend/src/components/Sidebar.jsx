import { useState } from "react"
import { validDriveUrl } from "../utils"
import ProgressBar from "./Progressbar"
import axios from "axios"

const Sidebar = ({progress, setProgress }) => {
  const [url, setUrl] = useState("")
  const [ws, setWs] = useState(null);
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (url) => {
    setLoading(true)
    try {
      if (ws) {
        ws.close()
      }
      const socket = new WebSocket(import.meta.env.VITE_SOCKET_URL);

      socket.onopen = () => console.log("WebSocket connected");
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.file) {
          // setAssets((prevAssets) => [...prevAssets, data.file]);
          // assetsRef.current.push(data.file)
          // console.log(assetsRef.current)
          setProgress({
            completed: data.completedFiles,
            total: data.totalFiles
          });
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
    </div>
  )
}

export default Sidebar