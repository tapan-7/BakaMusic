import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Playlists: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
  Artists: undefined;
  Albums: undefined;
  AllMusic: undefined;
  Settings: undefined;
  TrackList: { title: string; type: 'artist' | 'album' | 'playlist'; value: string };
};
