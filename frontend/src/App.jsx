import { useRef, useState } from "react";
import './App.css';
import MediaGallery from "./components/MediaGallery";
import Sidebar from "./components/Sidebar";

function App() {
  const [progress, setProgress] = useState({ completed: 0, total: 0, folderId: "" });
  const assetsRef = useRef([]);
  const [currentFolderId, setCurrentFolderId] = useState("");
  const processedFolderIdsRef = useRef([]);

  return (
    <>
      <main className="app">
        <Sidebar
          progress={progress}
          setProgress={setProgress}
          assetsRef={assetsRef}
          setFolderId={setCurrentFolderId}
          processedFolderIdsRef={processedFolderIdsRef}
        />

        <MediaGallery
          folderId={currentFolderId}
          totalAssets={progress.total}
          completedAssets={progress.completed}
          realtimeAssets={assetsRef.current}
          realtime={currentFolderId === progress.folderId}
        />
      </main>

    </>
  )
}

export default App
