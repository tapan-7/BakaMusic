import { getAudioMetadata } from '@missingcore/audio-metadata';

export const extractTrackMetadata = async (uri: string): Promise<{ title?: string; artist?: string; album?: string; artwork?: string } | null> => {
  try {
    const response = await getAudioMetadata(uri, ['name', 'artist', 'album', 'artwork']);
    
    console.log(`[Metadata] Extracted metadata for URI: ${uri}`, {
        name: response.metadata.name,
        artist: response.metadata.artist,
        album: response.metadata.album,
        hasArtwork: !!response.metadata.artwork
    });
    
    let artwork = response.metadata.artwork;

    return {
      title: response.metadata.name,
      artist: response.metadata.artist,
      album: response.metadata.album,
      artwork: artwork
    };
  } catch (error) {
    return null;
  }
};
