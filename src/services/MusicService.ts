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

export const getAllTracks = async (): Promise<Track[]> => {
  const tracks: Track[] = [];

  const foldersToScan = [
    RNFS.ExternalStorageDirectoryPath + '/Music',
    RNFS.DownloadDirectoryPath,
  ];

  console.log('Scanning folders:', foldersToScan);

  for (const folder of foldersToScan) {
    try {
      if (await RNFS.exists(folder)) {
        const result = await RNFS.readDir(folder);
        
        for (const file of result) {
          if (file.isFile() && (file.name.endsWith('.mp3') || file.name.endsWith('.m4a'))) {
            tracks.push({
              id: file.path, 
              url: 'file://' + file.path,
              title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
              artist: 'Unknown Artist', 
              artwork: undefined, 
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
