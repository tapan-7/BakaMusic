import * as MediaLibrary from 'expo-media-library';
import { getAssetsAsync } from 'expo-media-library/legacy';
import { extractTrackMetadata } from './MetadataExtractor';
import { insertOrUpdateSong, deleteSongsNotInList, getSongById } from '../database/database';

export { extractTrackMetadata };

export interface ScannedTrack {
  id: string;
  url: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  artwork?: string;
  lastModified?: number;
}

export const requestMediaPermissions = async () => {
  console.log('Requesting media permissions...');
  const response = await MediaLibrary.requestPermissionsAsync(false, ['audio']);
  console.log('Permission response:', response);
  return response.status === 'granted';
};

export const syncLocalMusicInBackground = async (onProgress?: (track: ScannedTrack) => void): Promise<void> => {
  console.log('Starting background sync...');
  const hasPermission = await requestMediaPermissions();
  if (!hasPermission) {
    console.warn('Media permission denied or not granted yet.');
    return;
  }

  try {
    console.log('Fetching assets from device...');
    
    let allAssets: any[] = [];
    let hasNextPage = true;
    let after: string | undefined = undefined;

    while (hasNextPage) {
      const assetsPage = await getAssetsAsync({
        mediaType: 'audio',
        first: 500,
        after: after,
      });

      allAssets = allAssets.concat(assetsPage.assets);
      hasNextPage = assetsPage.hasNextPage;
      after = assetsPage.endCursor;
    }
    
    console.log(`Found ${allAssets.length} audio files in device media library.`);

    const currentAssetIds = allAssets.map(a => a.id);
    
    // Delete songs from DB that are no longer on device
    deleteSongsNotInList(currentAssetIds);

    // Incremental sync
    for (const asset of allAssets) {
      const existingTrack = getSongById(asset.id);
      
      const assetModificationTime = asset.modificationTime || 0;
      
      // If it's a new song or the file has been modified, extract metadata
      if (!existingTrack || existingTrack.lastModified !== assetModificationTime) {
        console.log(`Processing new/modified file: ${asset.filename}`);
        
        let title = asset.filename;
        if (title && title.lastIndexOf('.') > 0) {
          title = title.substring(0, title.lastIndexOf('.'));
        }

        const newTrack: ScannedTrack = {
          id: asset.id,
          url: asset.uri,
          title: title,
          artist: 'Unknown Artist',
          duration: asset.duration ?? 0,
          artwork: undefined,
          lastModified: assetModificationTime,
        };

        // Extract heavy metadata
        const metadata = await extractTrackMetadata(asset.uri);
        if (metadata) {
          newTrack.title = metadata.title || newTrack.title;
          newTrack.artist = metadata.artist || newTrack.artist;
          newTrack.album = metadata.album;
          newTrack.artwork = metadata.artwork;
        }

        insertOrUpdateSong(newTrack);
        
        // Notify store about new track
        if (onProgress) {
          onProgress(newTrack);
        }
      }
    }
    
    console.log('Background sync complete.');
  } catch (error) {
    console.error('Error syncing music:', error);
  }
};
