import { useState } from "react"
import { validDriveUrl } from "../utils"
import ProgressBar from "./Progressbar"

const Sidebar = ({ completed, total, handleSubmit, loading }) => {
  const [url, setUrl] = useState("")

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
      <ProgressBar completed={completed ?? 0} total={total} />
    </div>
  )
}

export default Sidebar