import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import indexedDBService from "../db";
import AssetsGrid from "./AssetsGrid";

const MediaGallery = ({ folderId }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const pageRef = useRef(1);
  const hasCalledInitialLoad = useRef(false);
  // const isMountedRef = useRef(true);


  // Use the provided folderId or a default value
  const effectiveFolderId = folderId || "1NOE6E0qXonBWPwsi2gGql0Wm1Cc54D5g";

  const fetchAssets = useCallback(async () => {
    if (loading) return [];
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/assets/${effectiveFolderId}`,
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
  }, [effectiveFolderId, loading]);


  useEffect(() => {
    // Reset state when folderId changes
    setAssets([]);
    pageRef.current = 1;

    // Initial load
    // loadMoreItems(0, 20);
    if (!hasCalledInitialLoad.current) {
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
