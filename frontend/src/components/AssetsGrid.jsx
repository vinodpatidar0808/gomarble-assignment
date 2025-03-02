import { useCallback, useRef, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid as Grid } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";

const AssetsGrid = ({ hasNextPage, isNextPageLoading, items, loadNextPage }) => {
  const itemCount = (items.length > 0 && hasNextPage) ? items.length + 1 : items.length;

  // const handleLoadMoreItems = isNextPageLoading ? () => { } : loadNextPage;
  // const isItemLoaded = index => !hasNextPage || index < items.length;


  const isItemLoaded = useCallback(index => {
    return !hasNextPage || index < items.length;
  }, [hasNextPage, items.length]);

  const handleLoadMoreItems = useCallback(() => {
    if (!isNextPageLoading && hasNextPage && items.length > 0) {
      return loadNextPage();
    }
    return Promise.resolve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNextPageLoading, hasNextPage, loadNextPage]);


  // Constants
  const COLUMN_GAP = 16;
  const ROW_GAP = 16;
  const MIN_COLUMN_WIDTH = 250; // Minimum width for an asset

  const Cell = ({ columnIndex, rowIndex, style, data }) => {
    const videoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const { items, columns, leftOffset } = data;

    const assetIndex = rowIndex * columns + columnIndex;

    // use debouncing, if frequent hover is causing issue,
    const handlePlay = useCallback(() => {
      const video = videoRef.current;
      if (video) {
        video
          .play()
          .catch((error) => {
            if (error.name !== "AbortError") {
              console.error("Video play error:", error);
            }
          });
        setIsHovered(true);
      }
    }, [setIsHovered]);

  
    const handlePause = useCallback(() => {
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.currentTime = 0;
        setIsHovered(false);
      }
    }, [setIsHovered]);


    // Return null for cells beyond the data range
    if (assetIndex >= items.length) return null;

    const asset = items[assetIndex];
    const fileType = asset.name.split(".").pop().toLowerCase(); // get file extension
    const isVideo = fileType === "mp4";

    // Adjust style to account for gaps properly
    const adjustedStyle = {
      ...style,
      left: parseFloat(style.left) + COLUMN_GAP * columnIndex + leftOffset,
      top: parseFloat(style.top) + ROW_GAP * rowIndex,
      width: parseFloat(style.width) - COLUMN_GAP,
      height: parseFloat(style.height) - ROW_GAP,
      padding: 0,
    };


    return (
      <div style={adjustedStyle} key={asset.name}>
        {!isVideo ? (
          <img
            src={asset.blobUrl || asset.url}
            alt={`Asset ${assetIndex}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 8
            }}
            loading="lazy"
          />
        ) : (
          <>
            {/* TODO: Add play button over video instead of play text */}
            {!isHovered && <div style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)", borderRadius: 8
            }}>
              Play
            </div>}
            <video
              ref={videoRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 8
              }}
              onMouseEnter={handlePlay}
              onMouseLeave={handlePause}
              muted
              loop
              preload="metadata"
            >
              <source src={asset.blobUrl || asset.url} type="video/mp4" alt={`Asset ${assetIndex}`} />
              Your browser does not support the video tag.
            </video>
          </>
        )}
      </div>
    );
  };

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <AutoSizer>
        {({ height, width }) => {
          // Calculate proper grid dimensions accounting for gaps
          const columns = Math.max(Math.floor((width + COLUMN_GAP) / (MIN_COLUMN_WIDTH + COLUMN_GAP)), 1);
          // column width based on available space
          const columnWidth = Math.min(
            MIN_COLUMN_WIDTH,
            (width - (columns - 1) * COLUMN_GAP) / columns
          );

          const gridContentWidth = columns * columnWidth + (columns - 1) * COLUMN_GAP;

          const leftOffset = Math.max(0, (width - gridContentWidth) / 2);

          const rowHeight = columnWidth; // 1:1 aspect ratio
          const rowCount = Math.ceil(itemCount / columns);

          return (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={itemCount}
              // loadMoreItems={loadMoreItems}
              loadMoreItems={handleLoadMoreItems}
              threshold={3} // Load more items earlier for smoother scrolling, in case of grid if we reach the end of the grid, we want to load more items before reaching the end threshold defines number of rows and it starts fetching 
            >
              {({ onItemsRendered, ref }) => {

                const handleItemsRendered = gridProps => {
                  const { visibleRowStartIndex, visibleRowStopIndex } = gridProps;

                  // Convert row indices to item indices
                  const startIndex = visibleRowStartIndex * columns;
                  const stopIndex = Math.min((visibleRowStopIndex + 1) * columns - 1, itemCount - 1);

                  onItemsRendered({
                    visibleStartIndex: startIndex,
                    visibleStopIndex: stopIndex,
                  });
                };

                return (<Grid
                  height={height}
                  // height={width}
                  width={width}
                  columnCount={columns}
                  columnWidth={columnWidth + COLUMN_GAP}
                  rowCount={rowCount}
                  rowHeight={rowHeight + ROW_GAP}
                  onItemsRendered={handleItemsRendered}
                  ref={ref}
                  itemData={{ items, columns, leftOffset }}
                  overscanRowCount={2} // Increase overscan for smoother scrolling. renders 2 extra rows on top and bottom outside of visible viewport area to make scrolling smoother
                  style={{ overflow: "auto" }}
                  useIsScrolling
                >
                  {Cell}
                </Grid>
                )
              }
              }
            </InfiniteLoader>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default AssetsGrid;
