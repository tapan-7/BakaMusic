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

const musicExtensions = ['.mp3', '.m4a', '.wav', '.flac', '.aac'];

const scanDirectory = async (dir: string): Promise<Track[]> => {
  let tracks: Track[] = [];
  try {
    if (await RNFS.exists(dir)) {
      const items = await RNFS.readDir(dir);
      for (const item of items) {
        if (item.isDirectory()) {
          // Recursively scan subdirectories
          const subDirTracks = await scanDirectory(item.path);
          tracks = tracks.concat(subDirTracks);
        } else if (item.isFile() && musicExtensions.some(ext => item.name.endsWith(ext))) {
          const { title, artist } = extractMetadataFromFilename(item.name);
          tracks.push({
            id: item.path,
            url: 'file://' + item.path,
            title,
            artist,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  return tracks;
};

export const getAllTracks = async (): Promise<Track[]> => {
  const foldersToScan = [
    RNFS.ExternalStorageDirectoryPath,
    RNFS.DownloadDirectoryPath,
  ];

  let allTracks: Track[] = [];

  for (const folder of foldersToScan) {
    const folderTracks = await scanDirectory(folder);
    allTracks = allTracks.concat(folderTracks);
  }

  // Remove duplicates
  const uniqueTracks = allTracks.filter(
    (track, index, self) => index === self.findIndex(t => t.id === track.id)
  );

  console.log(`Found ${uniqueTracks.length} unique tracks.`);

  if (uniqueTracks.length === 0) {
    console.log("No tracks found, returning mock data");
    return [
      {
        id: '1',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        title: 'Demo Song 1',
        artist: 'SoundHelix',
        artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60'
      },
      // ... (rest of mock data)
    ];
  }

  return uniqueTracks;
};

