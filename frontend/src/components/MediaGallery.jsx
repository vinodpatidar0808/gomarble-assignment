import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import AssetsGrid from "./AssetsGrid";

const MediaGallery = ({ folderId, totalAssets, completedAssets }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const pageRef = useRef(1);
  const isMountedRef = useRef(true);
  console.log("MediaGallery2")

  // Use the provided folderId or a default value
  const effectiveFolderId = folderId || "1NOE6E0qXonBWPwsi2gGql0Wm1Cc54D5g";

  const fetchAssets = useCallback(async () => {
    if (loading) return [];

    console.log("fetchAssets", effectiveFolderId, pageRef.current);
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
      console.log("data: ", data)
      setTotalItems(data.totalFiles);
      return data.paginatedFiles;
    } catch (error) {
      console.error("Error fetching assets:", error);
      return [];
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [effectiveFolderId, loading]);

  useEffect(() => {
    // Reset state when folderId changes
    setAssets([]);
    pageRef.current = 1;

    // Initial load
    loadMoreItems(0, 20);

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [folderId]);

  const loadMoreItems = async (startIndex, stopIndex) => {
    const newAssets = await fetchAssets();

    if (newAssets.length > 0) {
      setAssets(prev => [...prev, ...newAssets]);
    }
  };

  console.log("assets: ", assets.length)
  console.log("totalItems: ", totalItems)
  // Show a loading state while initially fetching data
  if (assets.length === 0 && loading) {
    return <div>Loading assets...</div>;
  }


  // Show message when no assets found
  if (assets.length === 0 && !loading && pageRef.current > 1) {
    return <div>No assets found in this folder</div>;
  }

  return (
    <div style={{width: "100%", height: "100%", display: "flex", justifyContent: "center", position:"relative"}}>
      <div style={{ width: "100%", height: "100%", overflow:"hidden" }}>
        <AssetsGrid
          hasNextPage={totalItems > assets.length}
          isNextPageLoading={loading}
          items={assets}
          loadNextPage={loadMoreItems}
        />
      </div>
    </div>
  );
};

export default MediaGallery;
