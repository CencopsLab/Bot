import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme, ScrollView, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import ScreenHeader from '@/components/ScreenHeader';
import EmergencyButton from '@/components/EmergencyButton';
import { POLICE_STATIONS } from '@/data/stations';

// react-native-maps needs a native module, so this file guards the import.
// In Expo Go on Android/iOS it works out of the box; on web it is skipped.
let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}

export default function LocatorScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const mapRef = useRef<any>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    const current = await Location.getCurrentPositionAsync({});
    setLocation(current);
    mapRef.current?.animateToRegion(
      {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      },
      500
    );
  };

  const openInMaps = (lat: number, lng: number, label: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${encodeURIComponent(label)})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    });
    if (url) Linking.openURL(url);
  };

  const searchNearby = () => {
    const query = 'cyber police station near me';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    Linking.openURL(url);
  };

  const initialRegion = {
    latitude: 30.7333,
    longitude: 76.7794, // Chandigarh
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Nearby help" subtitle="Map and cybercrime helpline" />

        <View style={[styles.mapWrap, { borderColor: theme.border }]}>
          {MapView ? (
            <MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={initialRegion} showsUserLocation>
              {POLICE_STATIONS.map((station) => (
                <Marker
                  key={station.id}
                  coordinate={{ latitude: station.latitude, longitude: station.longitude }}
                  title={station.name}
                  description={station.address}
                />
              ))}
            </MapView>
          ) : (
            <View style={[styles.mapFallback, { backgroundColor: theme.surface }]}>
              <Ionicons name="map-outline" size={28} color={theme.primary} />
              <Text style={[typography.bodyBold, { color: theme.text, marginTop: 8 }]}>
                Map available on your phone
              </Text>
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: 4, textAlign: 'center' }]}>
                Open CyberSaathi in Expo Go to use the native map and location permission.
              </Text>
            </View>
          )}
        </View>

        {permissionDenied ? (
          <View style={[styles.notice, { borderColor: theme.warning, backgroundColor: theme.warning + '14' }]}>
            <Text style={{ color: theme.text }}>
              Location permission was not granted. We use your location only to center the map on
              nearby cyber police stations.
            </Text>
            <Pressable onPress={requestLocation} style={{ marginTop: 8 }}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={requestLocation}
            style={[styles.secondaryButton, { backgroundColor: theme.primary }]}
          >
            <Text style={[typography.bodyBold, { color: '#fff' }]}>Center map on my location</Text>
          </Pressable>
        )}

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <Text style={[typography.bodyBold, { color: theme.text }]}>Find a cyber police station</Text>
          {POLICE_STATIONS.length === 0 ? (
            <Text style={[typography.caption, { color: theme.textMuted, marginTop: 4 }]}>
              Station pins are not shown because a verified station directory was not included. Open a
              live Maps search for current nearby results.
            </Text>
          ) : (
            POLICE_STATIONS.map((station) => (
              <View key={station.id} style={styles.stationRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body, { color: theme.text }]}>{station.name}</Text>
                  <Text style={[typography.caption, { color: theme.textMuted }]}>{station.address}</Text>
                </View>
                <Pressable
                  onPress={() => openInMaps(station.latitude, station.longitude, station.name)}
                  accessibilityLabel={`Open ${station.name} in Maps`}
                >
                  <Ionicons name="navigate-outline" size={20} color={theme.primary} />
                </Pressable>
                {station.phone ? (
                  <Pressable
                    onPress={() => Linking.openURL(`tel:${station.phone}`)}
                    accessibilityLabel={`Call ${station.name}`}
                    style={{ marginLeft: 14 }}
                  >
                    <Ionicons name="call-outline" size={20} color={theme.primary} />
                  </Pressable>
                ) : null}
              </View>
            ))
          )}
        </View>

        <Pressable onPress={searchNearby} style={[styles.secondaryOutline, { borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={16} color={theme.primary} />
          <Text style={[typography.bodyBold, { color: theme.primary, marginLeft: 8 }]}>
            Search nearby stations in Maps
          </Text>
        </Pressable>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 16 }]}>
          <Text style={[typography.bodyBold, { color: theme.text }]}>Financial cyber fraud?</Text>
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: 4, marginBottom: 12 }]}>
            Call 1930 promptly to report it.
          </Text>
          <EmergencyButton label="Call 1930 Helpline" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  mapWrap: { height: 220, borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  mapFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  notice: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 16 },
  secondaryButton: { marginTop: 16, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 16 },
  stationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  secondaryOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 12,
  },
});
