import { useRef, useState } from "react";
import './App.css';
import MediaGallery from "./components/MediaGallery";
import Sidebar from "./components/Sidebar";

function App() {
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const assetsRef = useRef([]);
  // const folderIds = localStorage.getItem("folderIds") ? JSON.parse(localStorage.getItem("folderIds")) : [];

  return (
    <>
      <main className="app">
        <Sidebar progress={progress} setProgress={setProgress} assetsRef={assetsRef} />
        <MediaGallery folderId={""} totalAssets={progress.total} completedAssets={progress.completed} realtimeAssets={assetsRef.current} realtime={true} />
      </main>

    </>
  )
}

export default App
