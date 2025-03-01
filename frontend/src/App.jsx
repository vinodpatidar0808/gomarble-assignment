import {useState } from "react";
import './App.css';
import MediaGallery from "./components/MediaGallery";
import Sidebar from "./components/Sidebar";

function App() {
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  return (
    <>
      <main className="app">
        <Sidebar progress={progress} setProgress={setProgress}  />
        <MediaGallery totalAssets={progress.total} completedAssets={progress.completed} />
      </main>

    </>
  )
}

export default App
