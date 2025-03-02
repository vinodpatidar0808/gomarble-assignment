import { useRef, useState } from "react";
import './App.css';
import MediaGallery from "./components/MediaGallery";
import Sidebar from "./components/Sidebar";

function App() {
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const assetsRef = useRef([]);

  return (
    <>
      <main className="app">
        <Sidebar progress={progress} setProgress={setProgress} assetsRef={assetsRef} />
        <MediaGallery totalAssets={progress.total} completedAssets={progress.completed} realtimeAssets={assetsRef.current} realtime={true} />
      </main>

    </>
  )
}

export default App
