import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Music2 } from 'lucide-react-native';
import {
  ScannedTrack,
  extractTrackMetadata,
} from '../services/musicScannerService';
import { usePlayerStore } from '../store/playerStore';

const DEFAULT_ARTWORK =
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop';

interface TrackListItemProps {
  track: ScannedTrack;
  onPress: (track: any) => void;
  layout?: 'row' | 'column';
}

export const TrackListItem: React.FC<TrackListItemProps> = ({
  track,
  onPress,
  layout = 'row',
}) => {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying = currentTrack?.id === track.id;

  // Local state for lazy metadata
  const [localArtwork, setLocalArtwork] = useState<string | undefined>(
    track.artwork,
  );
  const [localArtist, setLocalArtist] = useState<string>(
    track.artist || 'Unknown Artist',
  );
  const [localTitle, setLocalTitle] = useState<string>(track.title);

  useEffect(() => {
    // If it's already extracted or playing, skip
    if (track.artwork && track.artist !== 'Unknown Artist') return;

    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const meta = await extractTrackMetadata(track.url);
        if (isMounted && meta) {
          if (meta.artwork) setLocalArtwork(meta.artwork);
          if (meta.artist) setLocalArtist(meta.artist);
          if (meta.title) setLocalTitle(meta.title);
        }
      } catch (e) {
        // silently fail
      }
    };

    fetchMetadata();

    return () => {
      isMounted = false;
    };
  }, [track.url]);

  if (layout === 'column') {
    return (
      <TouchableOpacity
        onPress={() =>
          onPress({
            ...track,
            title: localTitle,
            artist: localArtist,
            artwork: localArtwork || DEFAULT_ARTWORK,
          })
        }
        className="mr-4 w-32"
      >
        {localArtwork ? (
          <View className="w-32 h-32 rounded-2xl mb-2 bg-white/10 overflow-hidden items-center justify-center">
            <Image
              source={{ uri: localArtwork }}
              className="absolute inset-0 w-full h-32 rounded-2xl mb-2 bg-white/10"
            />
          </View>
        ) : (
          <View className="w-32 h-32 rounded-2xl mb-2 bg-white/10 items-center justify-center">
            <Music2 size={32} color="#666" />
          </View>
        )}
        <Text
          numberOfLines={1}
          className={`font-medium text-sm ${
            isPlaying ? 'text-primary font-bold' : 'text-white'
          }`}
        >
          {localTitle}
        </Text>
        <Text numberOfLines={1} className="text-gray-500 text-xs">
          {localArtist}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() =>
        onPress({
          ...track,
          title: localTitle,
          artist: localArtist,
          artwork: localArtwork || DEFAULT_ARTWORK,
        })
      }
      className="flex-row items-center mb-4"
    >
      {localArtwork ? (
        <View className="w-14 h-14 rounded-lg mr-4 bg-white/10 overflow-hidden items-center justify-center">
          <Image
            source={{ uri: localArtwork }}
            className="absolute inset-0 w-full h-full"
          />
        </View>
      ) : (
        <View className="w-14 h-14 rounded-lg mr-4 bg-white/10 items-center justify-center">
          <Music2 size={24} color="#666" />
        </View>
      )}

      <View className="flex-1 justify-center">
        <Text
          numberOfLines={1}
          className={`font-medium text-base mb-1 ${
            isPlaying ? 'text-primary font-bold' : 'text-white'
          }`}
        >
          {localTitle}
        </Text>
        <Text numberOfLines={1} className="text-gray-400 text-sm">
          {localArtist}
        </Text>
      </View>

      {isPlaying && (
        <View className="flex-row items-end h-4 gap-[2px]">
          <View className="w-1 h-3 bg-primary rounded-full" />
          <View className="w-1 h-4 bg-primary rounded-full" />
          <View className="w-1 h-2 bg-primary rounded-full" />
        </View>
      )}
    </TouchableOpacity>
  );
};
