
const dummyData = [
  { type: "image", url: "https://images.pexels.com/photos/1000001/pexels-photo-1000001.jpeg", name: "Sunset View" },
  { type: "video", url: "https://www.pexels.com/video/2000001/", name: "Ocean Waves" },
  { type: "image", url: "https://images.pexels.com/photos/1000002/pexels-photo-1000002.jpeg", name: "Mountain Landscape" },
  { type: "video", url: "https://www.pexels.com/video/2000002/", name: "City Timelapse" },
  { type: "image", url: "https://images.pexels.com/photos/1000003/pexels-photo-1000003.jpeg", name: "Forest Pathway" },
  { type: "video", url: "https://www.pexels.com/video/2000003/", name: "Running River" },
  { type: "image", url: "https://images.pexels.com/photos/1000004/pexels-photo-1000004.jpeg", name: "Snowy Peaks" },
  { type: "video", url: "https://www.pexels.com/video/2000004/", name: "Fireplace Ambience" },
  { type: "image", url: "https://images.pexels.com/photos/1000005/pexels-photo-1000005.jpeg", name: "Desert Dunes" },
  { type: "video", url: "https://www.pexels.com/video/2000005/", name: "Waterfall Scene" },
];


const MediaGallery = () => {
  return (
    <div className="container">
      <h2>Media Gallery</h2>
      <div className="grid">
        {dummyData.map((media, index) => (
          <div key={index} className="grid-item">
            <div className="grid-item-content">
              {media.type === "image" ? (
                <img src={media.url} alt="Square image 1" />
              ) : (
                <video controls>
                  <source src={media.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>

        ))}
      </div>
    </div>
  )
}

export default MediaGallery