import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
  duration?: number;
}

// Function to extract artist and title from filename
const extractMetadataFromFilename = (filename: string): { title: string, artist: string } => {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

  // Try to extract artist and title from patterns like "Artist - Title.mp3"
  const parts = nameWithoutExt.split(' - ');
  if (parts.length >= 2) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim()
    };
  }

  // If no pattern found, use the whole name as title
  return {
    artist: 'Unknown Artist',
    title: nameWithoutExt
  };
};

export const getAllTracks = async (): Promise<Track[]> => {
  const tracks: Track[] = [];

  // Define more comprehensive music directories to scan
  const foldersToScan = [
    RNFS.ExternalStorageDirectoryPath + '/Music',
    RNFS.DownloadDirectoryPath,
    RNFS.MoviesDirectoryPath,
    RNFS.PicturesDirectoryPath,
    RNFS.DocumentDirectoryPath,
    // Additional common music directories
    '/storage/emulated/0/Music',
    '/storage/emulated/0/Download',
    '/storage/emulated/0/DCIM/Camera',
    '/storage/emulated/0/Alarms',
    '/storage/emulated/0/Ringtones',
    '/storage/emulated/0/Notifications',
  ];

  console.log('Scanning folders:', foldersToScan);

  for (const folder of foldersToScan) {
    try {
      if (await RNFS.exists(folder)) {
        const result = await RNFS.readDir(folder);

        for (const file of result) {
          if (file.isFile() && (file.name.endsWith('.mp3') || file.name.endsWith('.m4a') || file.name.endsWith('.wav') || file.name.endsWith('.flac') || file.name.endsWith('.aac'))) {
            const filePath = file.path;
            const fileUrl = 'file://' + filePath;

            // Extract metadata from filename
            const { title, artist } = extractMetadataFromFilename(file.name);

            tracks.push({
              id: filePath,
              url: fileUrl,
              title: title,
              artist: artist,
              artwork: undefined, // We'll use placeholder artwork for now
              duration: undefined, // Duration will be available when the track is played
            });
          }
        }
      }
    } catch (e) {
      console.log('Error reading dir:', folder, e);
    }
  }

  // Fallback mock data if empty (for emulator/testing)
  if (tracks.length === 0) {
      console.log("No tracks found, returning mock data");
      return [
          {
              id: '1',
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              title: 'Demo Song 1',
              artist: 'SoundHelix',
              artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60'
          },
          {
              id: '2',
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
              title: 'Demo Song 2',
              artist: 'SoundHelix',
              artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60'
          },
          {
              id: '3',
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
              title: 'Demo Song 3',
              artist: 'SoundHelix',
              artwork: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500&auto=format&fit=crop&q=60'
          },
      ];
  }

  return tracks;
};
