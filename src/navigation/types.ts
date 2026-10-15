import type { NavigatorScreenParams } from '@react-navigation/native';

export type MoreStackParamList = {
  MoreHome: undefined;
  Services: undefined;
  Handbooks: undefined;
  PrivacyNotice: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Chat: undefined;
  Scan: undefined;
  Help: undefined;
  More: NavigatorScreenParams<MoreStackParamList>;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Quiz: undefined;
};
