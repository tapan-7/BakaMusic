import { AudioStatus } from 'expo-audio';
import { Track } from './MusicService';
import { playerManager } from './PlayerManager';

export const setupPlayer = async () => {
  return await playerManager.initialize();
};

export const playTrack = async (track: Track) => {
  return await playerManager.playTrack(track);
};

export const pauseTrack = async () => {
  return await playerManager.pauseTrack();
};

export const resumeTrack = async () => {
  return await playerManager.resumeTrack();
};

export const stopTrack = async () => {
  return await playerManager.stopTrack();
};

export const getCurrentTrackPosition = async () => {
  return await playerManager.getCurrentTrackPosition();
};

export const seekToPosition = async (positionSec: number) => {
  return await playerManager.seekToPosition(positionSec);
};

export const setOnTrackFinishCallback = (callback: () => void) => {
  playerManager.setOnTrackFinishCallback(callback);
};

// Set callback for playback updates
export const setPlaybackCallback = (callback: (status: AudioStatus) => void) => {
  playerManager.setPlaybackCallback(callback);
};

// Cleanup function
export const cleanupPlayer = async () => {
  return await playerManager.cleanup();
};
