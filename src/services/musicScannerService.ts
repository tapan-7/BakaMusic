import * as MediaLibrary from 'expo-media-library';
import { Query, AssetField, MediaType } from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { parseBuffer } from '@missingcore/audio-metadata';
import { Buffer } from 'buffer';

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
    console.log('Fetching assets using the new Query API...');
    const assets = await new Query()
      .eq(AssetField.MEDIA_TYPE, MediaType.AUDIO)
      .limit(100) // Process first 100 for performance, can paginate later
      .exe();
    
    console.log(`Found ${assets.length} audio files in device media library.`);

    const tracks: ScannedTrack[] = [];

    for (const asset of assets) {
      try {
        const fileUri = await asset.getUri();
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        let title = await asset.getFilename();
        let artist = 'Unknown Artist';
        let artwork;

        if (fileInfo.exists && !fileInfo.isDirectory) {
            try {
                // To avoid reading the whole file which is slow, we can just read the first part
                // However, expo-file-system readAsStringAsync with encoding base64 can be slow for large files
                // We read up to 256KB to hopefully catch the ID3 tag
                const lengthToRead = Math.min(256 * 1024, fileInfo.size);
                const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
                    encoding: FileSystem.EncodingType.Base64,
                    length: lengthToRead,
                    position: 0
                });
                
                const buffer = Buffer.from(fileBase64, 'base64');
                const metadata = parseBuffer(buffer);
                
                if (metadata.title) title = metadata.title;
                if (metadata.artist) artist = metadata.artist;
                
                // If there's an image
                if (metadata.images && metadata.images.length > 0) {
                    const img = metadata.images[0];
                    const base64Image = Buffer.from(img.data).toString('base64');
                    artwork = `data:${img.mime};base64,${base64Image}`;
                }
            } catch (err) {
                // If metadata parsing fails, fallback to defaults
                console.log(`Could not parse metadata for ${title}`);
            }
        }

        const duration = await asset.getDuration();

        tracks.push({
          id: asset.id,
          url: fileUri,
          title: title,
          artist: artist,
          duration: duration ?? 0,
          artwork: artwork,
        });
      } catch (err) {
        console.warn(`Error processing asset ${asset.id}:`, err);
      }
    }

    return tracks;
  } catch (error) {
    console.error('Error scanning music:', error);
    return [];
  }
};
