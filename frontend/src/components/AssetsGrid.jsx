import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid as Grid } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";

const AssetsGrid = ({ hasNextPage, isNextPageLoading, items, loadNextPage }) => {
  const itemCount = hasNextPage ? items.length + 1 : items.length;
  const loadMoreItems = isNextPageLoading ? () => { } : loadNextPage;
  const isItemLoaded = index => !hasNextPage || index < items.length;

  // Constants
  const COLUMN_GAP = 16;
  const ROW_GAP = 16;
  const MIN_COLUMN_WIDTH = 250; // Minimum width for an asset

  const Cell = ({ columnIndex, rowIndex, style, data }) => {
    const { items, columns, leftOffset } = data;

    const assetIndex = rowIndex * columns + columnIndex;

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
            src={asset.url}
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
          <video
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 8
            }}
            onMouseEnter={(e) => e.target.play()}
            onMouseLeave={(e) => {
              e.target.pause();
              e.target.currentTime = 0;
            }}
            muted
            loop
            preload="metadata"
          >
            <source src={asset.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    );
  };

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <AutoSizer>
        {({ height, width }) => {
          // Calculate proper grid dimensions accounting for gaps
          const columns = Math.max(Math.floor((width + COLUMN_GAP) / (MIN_COLUMN_WIDTH +  COLUMN_GAP)), 1);
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
              loadMoreItems={loadMoreItems}
              threshold={10} // Load more items earlier for smoother scrolling
            >
              {({ onItemsRendered, ref }) => (
                <Grid
                  height={height}
                  // height={width}
                  width={width}
                  columnCount={columns}
                  columnWidth={columnWidth + COLUMN_GAP}
                  rowCount={rowCount}
                  rowHeight={rowHeight + ROW_GAP}
                  onItemsRendered={({ visibleRowStartIndex, visibleRowStopIndex }) =>
                    onItemsRendered({
                      startIndex: visibleRowStartIndex * columns,
                      stopIndex: (visibleRowStopIndex + 1) * columns - 1,
                    })
                  }
                  ref={ref}
                  itemData={{ items, columns, leftOffset }}
                  overscanRowCount={10} // Increase overscan for smoother scrolling
                  style={{ overflow: "auto" }}
                >
                  {Cell}
                </Grid>
              )}
            </InfiniteLoader>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default AssetsGrid;
