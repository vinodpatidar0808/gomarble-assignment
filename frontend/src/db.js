// contains code related with indexDb, which will store and retrieve data from the browser indexDb

const INDEXED_DB_MEDIA_TTL = 7 // 7 days
const INDEXED_DB_NAME = 'media-cache'
const INDEXED_DB_STORE_NAME = 'media'

class IndexedDBService {
  #dbInstance = null
  #indexDBName = ''
  #storeName = ''

  constructor(indexDBName, storeName) {
    this.#indexDBName = indexDBName
    this.#storeName = storeName
    this.createIndexedDB()
  }

  async createIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.#indexDBName, 1)

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(this.#storeName)) {
          const objectStore = db.createObjectStore(this.#storeName, { keyPath: 'url' })
          // TODO: change indexes based on data to be stored
          objectStore.createIndex('name', 'name', { unique: false })
          objectStore.createIndex('blobUrl', 'blobUrl', { unique: false })
          objectStore.createIndex('timestamp', 'timestamp', { unique: false })
          //TODO:  use folder id to store data in different folders
          objectStore.createIndex('folderId', 'folderId', { unique: false });

        }
      }

      request.onsuccess = (event) => {
        this.#dbInstance = event.target.result
        if (this.#dbInstance) {
          this.deleteDataFromIndexedDB(this.#dbInstance)
        }
        resolve(this.#dbInstance)
      }

      request.onerror = (event) => {
        reject(new Error('Error opening IndexedDB: ' + event.target.errorCode))
      }
    })
  }

  // Delete data older than INDEXED_DB_MEDIA_TTL days (7 days)
  deleteDataFromIndexedDB(db) {
    if (!db) return
    const tx = db.transaction(this.#storeName, 'readwrite')
    // const rangeForOneMinute = new Date().getTime() - 60000 // 1 minute deletion for testing 
    // const range = IDBKeyRange.upperBound(rangeForOneMinute)
    const range = IDBKeyRange.upperBound(INDEXED_DB_MEDIA_TTL)
    tx
      .objectStore(this.#storeName)
      .index('timestamp')
      .openCursor(range).onsuccess = function (e) {
        const cursor = e.target.result
        if (!cursor) return
        cursor.delete()
        cursor.continue()
      }
  }

  async processSingleMedia(db, media) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.#storeName], 'readonly')
      const objectStore = transaction.objectStore(this.#storeName)

      if (!db || !objectStore) {
        return
      }

      const getRequest = objectStore.get(media.url)

      getRequest.onsuccess = async (event) => {
        const result = event.target.result
        if (result) {
          const url = URL.createObjectURL(result.blobUrl)
          resolve({ ...media, blobUrl: url })
        } else {
          try {
            const response = await fetch(media.url)
            const blob = await response.blob()
            const blobUrl = URL.createObjectURL(blob)

            const saveTransaction = db.transaction([this.#storeName], 'readwrite')
            const saveObjectStore = saveTransaction.objectStore(this.#storeName)

            // Create a new record for the media
            // const mediaName = mediaURL.split('/').pop()

            const newRecord = {
              url: media.url,
              name: media.name,
              blobUrl: blob,
              timestamp: Math.ceil(new Date().getTime() / (1000 * 60 * 60 * 24)) // Store the timestamp in days
              // timestamp: new Date().getTime(), // Store the timestamp in milliseconds, for testing purposes to delete in few minutes or seconds
            }

            // Save the new record in IndexedDB
            const addRequest = saveObjectStore.add(newRecord)

            addRequest.onsuccess = () => {
              resolve({ ...media, blobUrl: blobUrl }) // Resolve with the new blob URL in object format
            }

            addRequest.onerror = (event) => {
              reject(new Error('Error saving media to IndexedDB: ' + event.target.errorCode))
            }
          } catch (error) {
            reject(new Error('Error fetching media: ' + error))
          }
        }
      }

      getRequest.onerror = (event) => {
        reject(new Error('Error retrieving media from IndexedDB: ' + event.target.errorCode))
      }
    })
  }

  // TODO: try to store media url folder wise if time permits and update the indexes
  async processMediaURLs(assets) {
    // Check if the DB is opened, if not wait for it to be created
    if (!this.#dbInstance) {
      console.log('Waiting for IndexedDB initialization...')
      this.#dbInstance = await this.createIndexedDB()
    }

    const processedMedia = []
    const processedMediaPromises = assets.map(async asset => {
      const mediaResult = await this.processSingleMedia(this.#dbInstance, asset)
      // push the media to the processedMedia array
      processedMedia.push(mediaResult)
    })

    try {
      // Wait for all the media processing to complete
      await Promise.all(processedMediaPromises)
      return processedMedia
    } catch (error) {
      console.error('Error processing media files: ', error)
      return []
    }
  }
}


// Usage
const indexedDBService = new IndexedDBService(INDEXED_DB_NAME, INDEXED_DB_STORE_NAME)

export default indexedDBService;

