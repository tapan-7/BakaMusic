import RNFS from 'react-native-fs';

export interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
  duration?: number;
}

const CACHE_FILE = `${RNFS.DocumentDirectoryPath}/track_cache.json`;
let isScanning = false;
let trackCache: Track[] | null = null;

// Function to extract artist and title from filename
const extractMetadataFromFilename = (
  filename: string,
): {title: string; artist: string} => {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const parts = nameWithoutExt.split(' - ');
  if (parts.length >= 2) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim(),
    };
  }
  return {
    artist: 'Unknown Artist',
    title: nameWithoutExt,
  };
};

const musicExtensions = ['.mp3', '.m4a', '.wav', '.flac', '.aac'];

const scanDirectory = async (dir: string): Promise<Track[]> => {
  let tracks: Track[] = [];
  try {
    if (!(await RNFS.exists(dir))) return [];

    const items = await RNFS.readDir(dir);
    for (const item of items) {
      if (item.isDirectory()) {
        tracks = tracks.concat(await scanDirectory(item.path));
      } else if (
        item.isFile() &&
        musicExtensions.some(ext => item.name.toLowerCase().endsWith(ext))
      ) {
        const {title, artist} = extractMetadataFromFilename(item.name);
        tracks.push({
          id: item.path,
          url: 'file://' + item.path,
          title,
          artist,
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  return tracks;
};

const performFullScan = async (): Promise<Track[]> => {
  const foldersToScan = [
    RNFS.ExternalStorageDirectoryPath,
    RNFS.DownloadDirectoryPath,
  ];

  let allTracks: Track[] = [];
  for (const folder of foldersToScan) {
    allTracks = allTracks.concat(await scanDirectory(folder));
  }

  const uniqueTracks = allTracks.filter(
    (track, index, self) => index === self.findIndex(t => t.id === track.id),
  );

  console.log(`Found ${uniqueTracks.length} unique tracks.`);

  if (uniqueTracks.length === 0) {
    console.log('No tracks found, returning mock data for demonstration.');
    return [
      {
        id: '1',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        title: 'Demo Song 1',
        artist: 'SoundHelix',
        artwork:
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60',
      },
    ];
  }
  return uniqueTracks;
};

const loadTracksFromCache = async (): Promise<Track[] | null> => {
  try {
    if (await RNFS.exists(CACHE_FILE)) {
      const cachedData = await RNFS.readFile(CACHE_FILE, 'utf8');
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.error('Failed to load tracks from cache:', error);
  }
  return null;
};

const saveTracksToCache = async (tracks: Track[]) => {
  try {
    await RNFS.writeFile(CACHE_FILE, JSON.stringify(tracks), 'utf8');
  } catch (error) {
    console.error('Failed to save tracks to cache:', error);
  }
};

const initializeTrackCache = async (forceRescan: boolean = false) => {
  if (isScanning) return;

  isScanning = true;
  try {
    if (!forceRescan) {
      trackCache = await loadTracksFromCache();
      if (trackCache) {
        console.log('Loaded tracks from cache.');
        return;
      }
    }

    console.log('Performing full file system scan for music...');
    const tracks = await performFullScan();
    trackCache = tracks;
    await saveTracksToCache(tracks);
    console.log('Scan complete. Saved tracks to cache.');
  } catch (error) {
    console.error('Error during track initialization:', error);
  } finally {
    isScanning = false;
  }
};

export const getTracks = async (options: {
  limit: number;
  offset: number;
  forceRescan?: boolean;
}): Promise<{tracks: Track[]; total: number}> => {
  if (!trackCache || options.forceRescan) {
    await initializeTrackCache(options.forceRescan);
  }

  const allTracks = trackCache || [];
  const paginatedTracks = allTracks.slice(
    options.offset,
    options.offset + options.limit,
  );

  return {
    tracks: paginatedTracks,
    total: allTracks.length,
  };
};

// Exporting old function name for compatibility until all components are updated.
export const getAllTracks = async (options: {
  limit?: number;
  offset?: number;
  forceRescan?: boolean;
} = {}): Promise<Track[]> => {
  const {limit = 20, offset = 0, forceRescan = false} = options;
  const result = await getTracks({limit, offset, forceRescan});
  return result.tracks;
};

export const rescanLibrary = async () => {
  await initializeTrackCache(true);
};

