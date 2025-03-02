import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import indexedDBService from "../db";
import AssetsGrid from "./AssetsGrid";

const MediaGallery = ({ folderId, realtime, realtimeAssets, totalAssets }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(totalAssets ?? 0);
  const pageRef = useRef(1);
  const hasCalledInitialLoad = useRef(false);
  const timerRef = useRef(null);

  const storeAssetsInIndexedDB = async (assets) => {
    const processedMedia = await indexedDBService.processMediaURLs(assets);
    setAssets(prev => [...prev, ...processedMedia]);
  }


  useEffect(() => {
    // Clear any existing interval first
    clearInterval(timerRef.current);

    // Only start interval if realtime is true and we haven't loaded all assets yet
    if (realtime && realtimeAssets.length > 0 && assets.length < totalAssets) {
      timerRef.current = setInterval(() => {
        storeAssetsInIndexedDB(realtimeAssets);

        // Check if we've reached the total assets and clear if needed
        if (assets.length >= totalAssets) {
          clearInterval(timerRef.current);
        }
      }, 500);
    }

    // Cleanup function
    return () => {
      clearInterval(timerRef.current);
    };
  }, [realtime, realtimeAssets, assets.length, totalAssets]);


  useEffect(() => {
    // Reset state when folderId changes
    setAssets([]);
    pageRef.current = 1;
    // hasCalledInitialLoad.current = false;

    // Initial load
    // loadMoreItems(0, 20);
    if (!hasCalledInitialLoad.current && !realtime) {
      hasCalledInitialLoad.current = true;
      // loadMoreItems();
      fetchAssets()
    }

    // // Cleanup function to prevent state updates after unmount
    // return () => {
    //   isMountedRef.current = false;
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  const fetchAssets = useCallback(async () => {
    if (loading) return [];
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/assets/${folderId}`,
        {
          params: {
            page: pageRef.current,
            limit: 20
          }
        }
      );

      // Check if component is still mounted
      // if (!isMountedRef.current) return [];

      const { data } = response;
      pageRef.current += 1;
      setTotalItems(data.totalFiles);
      if (data.paginatedFiles.length > 0) {
        // TODO: remove duplicates from assets
        // TODO: save media in indexedDB

        const processedMedia = await indexedDBService.processMediaURLs(data.paginatedFiles);
        setAssets(prev => [...prev, ...processedMedia]);

        // setAssets(prev => [...prev, ...data.paginatedFiles]);
      }
      return data.paginatedFiles;
    } catch (error) {
      console.error("Error fetching assets:", error);
      return [];
    } finally {
      // if (isMountedRef.current) {
      //   setLoading(false);
      // }
      setLoading(false);
    }
  }, [folderId, loading, realtime]);




  // Show a loading state while initially fetching data
  if (assets.length === 0 && loading) {
    return <div>Loading assets...</div>;
  }


  // Show message when no assets found
  if (assets.length === 0 && !loading && pageRef.current > 1) {
    return <div>No assets found in this folder</div>;
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", position: "relative" }}>
      <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
        <AssetsGrid
          hasNextPage={totalItems > assets.length}
          isNextPageLoading={false}
          items={assets}
          loadNextPage={fetchAssets}
        />
      </div>
    </div>
  );
};

export default MediaGallery;
