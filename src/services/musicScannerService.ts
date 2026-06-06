import * as MediaLibrary from 'expo-media-library';
import { getAssetsAsync } from 'expo-media-library/legacy';

export interface ScannedTrack {
  id: string;
  url: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  artwork?: string;
}

export const requestMediaPermissions = async () => {
  console.log('Requesting media permissions...');
  // Explicitly ask for audio permissions on Android 13+
  const response = await MediaLibrary.requestPermissionsAsync(false, ['audio']);
  console.log('Permission response:', response);
  return response.status === 'granted';
};

export const scanLocalMusic = async (): Promise<ScannedTrack[]> => {
  console.log('Starting scanLocalMusic...');
  const hasPermission = await requestMediaPermissions();
  if (!hasPermission) {
    console.warn('Media permission denied or not granted yet.');
    return [];
  }

  try {
    console.log('Fetching assets using the legacy fast bulk API...');
    
    // Using legacy getAssetsAsync because it returns filename, uri, and duration instantly in bulk
    // The new Query API requires thousands of slow bridge promises for each property.
    let allAssets: any[] = [];
    let hasNextPage = true;
    let after: string | undefined = undefined;

    while (hasNextPage) {
      const assetsPage = await getAssetsAsync({
        mediaType: 'audio',
        first: 500, // Fetch in batches of 500
        after: after,
      });

      allAssets = allAssets.concat(assetsPage.assets);
      hasNextPage = assetsPage.hasNextPage;
      after = assetsPage.endCursor;
    }
    
    console.log(`Found ${allAssets.length} audio files in device media library.`);

    const tracks: ScannedTrack[] = allAssets.map(asset => {
      let title = asset.filename;
      if (title && title.lastIndexOf('.') > 0) {
        title = title.substring(0, title.lastIndexOf('.'));
      }

      return {
        id: asset.id,
        url: asset.uri,
        title: title,
        artist: 'Unknown Artist',
        duration: asset.duration ?? 0,
        artwork: undefined, // Skip ID3 artwork to prevent freezing on large libraries
      };
    });

    return tracks;
  } catch (error) {
    console.error('Error scanning music:', error);
    return [];
  }
};
