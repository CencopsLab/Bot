import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme, Linking, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import ScreenHeader from '@/components/ScreenHeader';
import EmergencyButton from '@/components/EmergencyButton';
import PullToRefreshScrollView from '@/components/PullToRefreshScrollView';
import { fetchImportantContacts } from '@/api/contactsApi';
import { POLICE_STATIONS } from '@/data/stations';
import type { ImportantContact } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';

export default function LocatorScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const { t } = useLanguage();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [contacts, setContacts] = useState<ImportantContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);
  const mapRef = useRef<WebView>(null);
  const mapReadyRef = useRef(false);
  const centerMapRef = useRef(true);
  const headingSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    requestLocation();
    requestContacts();
    return () => {
      headingSubscriptionRef.current?.remove();
      locationSubscriptionRef.current?.remove();
    };
  }, []);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);
      centerMapRef.current = true;
      setLocation(await Location.getCurrentPositionAsync({}));
      if (!locationSubscriptionRef.current) {
        locationSubscriptionRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 10, timeInterval: 5000 },
          setLocation,
        );
      }
      if (!headingSubscriptionRef.current) {
        headingSubscriptionRef.current = await Location.watchHeadingAsync((nextHeading) => {
          const degrees = nextHeading.trueHeading >= 0 ? nextHeading.trueHeading : nextHeading.magHeading;
          setHeading(Number.isFinite(degrees) ? degrees : null);
        });
      }
    } catch {
      setPermissionDenied(true);
    }
  };

  const requestContacts = async () => {
    setContactsLoading(true);
    setContactsError(false);
    try {
      setContacts(await fetchImportantContacts());
    } catch {
      setContactsError(true);
    } finally {
      setContactsLoading(false);
    }
  };

  const openDirections = (lat: number, lng: number) => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
  };

  const openGoogleMaps = () => {
    const place = encodeURIComponent('Cyber Police Station, Chandigarh');
    const center = location ? `&center=${location.coords.latitude},${location.coords.longitude}` : '';
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${place}${center}`);
  };

  const updateMapLocation = () => {
    if (!mapReadyRef.current || !location) return;
    const centerOnUser = centerMapRef.current;
    centerMapRef.current = false;
    mapRef.current?.injectJavaScript(
      `window.updateUserMarker(${location.coords.latitude},${location.coords.longitude},${heading ?? 'null'},${centerOnUser}); true;`
    );
  };

  useEffect(() => {
    updateMapLocation();
  }, [location, heading]);

  const mapHtml = useMemo(() => createMapHtml(POLICE_STATIONS), []);

  const callContact = async (contact: ImportantContact) => {
    const phone = contact.phone.trim();
    if (!phone) {
      Alert.alert(contact.name, contact.description);
      return;
    }
    try {
      await Linking.openURL(`tel:${phone}`);
    } catch {
      Alert.alert(t('alert.unableDial'), t('alert.callManually', { number: phone }));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <PullToRefreshScrollView onRefresh={requestContacts} contentContainerStyle={styles.content}>
        <ScreenHeader title={t('locator.title')} subtitle={t('locator.subtitle')} />

        <View style={[styles.mapWrap, { borderColor: theme.border }]}>
          <WebView
            ref={mapRef}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={StyleSheet.absoluteFill}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            onLoadEnd={() => {
              mapReadyRef.current = true;
              updateMapLocation();
            }}
          />
        </View>

        <View style={styles.mapActions}>
          <Pressable
            onPress={requestLocation}
            accessibilityRole="button"
            style={[styles.secondaryButton, styles.mapActionButton, { backgroundColor: theme.primary }]}
          >
            <Text style={[typography.bodyBold, { color: '#fff' }]}>
              {permissionDenied ? t('common.tryAgain') : t('locator.center')}
            </Text>
          </Pressable>
          <Pressable
            onPress={openGoogleMaps}
            accessibilityRole="button"
            style={[styles.secondaryButton, styles.mapActionButton, styles.googleMapsButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
          >
            <Ionicons name="map-outline" size={18} color={theme.primary} />
            <Text style={[typography.bodyBold, { color: theme.primary }]}>{t('locator.openGoogleMaps')}</Text>
          </Pressable>
        </View>

        {permissionDenied ? (
          <View style={[styles.notice, { borderColor: theme.warning, backgroundColor: theme.warning + '14' }]}>
            <Text style={{ color: theme.text }}>{t('locator.locationDenied')}</Text>
          </View>
        ) : null}

        {!permissionDenied && heading === null ? (
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: 6 }]}>{t('locator.headingUnavailable')}</Text>
        ) : null}

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <Text style={[typography.bodyBold, { color: theme.text }]}>{t('locator.findStation')}</Text>
          {POLICE_STATIONS.length === 0 ? (
            <Text style={[typography.caption, { color: theme.textMuted, marginTop: 4 }]}>
              {t('locator.noStations')}
            </Text>
          ) : (
            POLICE_STATIONS.map((station) => (
              <View key={station.id} style={styles.stationRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body, { color: theme.text }]}>{t(`station.${station.id}.name`)}</Text>
                  <Text style={[typography.caption, { color: theme.textMuted }]}>{t(`station.${station.id}.address`)}</Text>
                </View>
                <Pressable
                  onPress={() => openDirections(station.latitude, station.longitude)}
                    accessibilityLabel={t('locator.directions', { name: t(`station.${station.id}.name`) })}
                >
                  <Ionicons name="navigate-outline" size={20} color={theme.primary} />
                </Pressable>
                {station.phone ? (
                  <Pressable
                    onPress={() => Linking.openURL(`tel:${station.phone}`)}
                    accessibilityLabel={t('locator.callStation', { name: t(`station.${station.id}.name`) })}
                    style={{ marginLeft: 14 }}
                  >
                    <Ionicons name="call-outline" size={20} color={theme.primary} />
                  </Pressable>
                ) : null}
              </View>
            ))
          )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 16 }]}> 
          <Text style={[typography.bodyBold, { color: theme.text }]}>{t('locator.importantContacts')}</Text>
          {contactsLoading ? (
            <ActivityIndicator size="small" color={theme.primary} style={styles.contactsLoading} />
          ) : contactsError ? (
            <View style={styles.contactsError}>
              <Text style={[typography.caption, { color: theme.textMuted, flex: 1 }]}>{t('chat.genericError')}</Text>
              <Pressable onPress={requestContacts} accessibilityRole="button">
                <Text style={{ color: theme.primary, fontWeight: '700' }}>{t('common.tryAgain')}</Text>
              </Pressable>
            </View>
          ) : contacts.map((contact) => (
            <Pressable key={contact.id} onPress={() => callContact(contact)} style={styles.contactRow}>
              <View style={styles.contactIcon}>
                <Ionicons name="call-outline" size={18} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: theme.text }]}>{contact.name}</Text>
                <Text style={[typography.caption, { color: theme.textMuted }]}>{contact.role}{contact.phone ? ` · ${contact.phone}` : ''}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </Pressable>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 16 }]}>
          <Text style={[typography.bodyBold, { color: theme.text }]}>{t('locator.financial')}</Text>
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: 4, marginBottom: 12 }]}>
            {t('locator.financialHint')}
          </Text>
          <EmergencyButton label={t('locator.helpline')} />
        </View>
      </PullToRefreshScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  mapWrap: { height: 220, borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  notice: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 16 },
  mapActions: { flexDirection: 'row', gap: 8 },
  secondaryButton: { marginTop: 12, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  mapActionButton: { flex: 1, justifyContent: 'center', minHeight: 46 },
  googleMapsButton: { borderWidth: 1, flexDirection: 'row', gap: 6, paddingHorizontal: 8 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 16 },
  stationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  contactsLoading: { marginTop: 14, alignSelf: 'flex-start' },
  contactsError: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  contactIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#145C6314' },
});

function createMapHtml(stations: typeof POLICE_STATIONS) {
  const center = [30.7386034, 76.7781604];
  const stationData = stations.map((station) => ({ latitude: station.latitude, longitude: station.longitude, name: station.name }));
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1.0,user-scalable=no"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>
    html,body,#map{height:100%;width:100%;margin:0}.leaflet-control-attribution{font-size:9px}
    .police-pin{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border:2px solid white;border-radius:50%;background:#112E51;box-shadow:0 2px 8px #0006;font-size:21px}
    .user-pin{position:relative;width:42px;height:42px}.user-halo{position:absolute;left:2px;top:2px;width:38px;height:38px;border-radius:50%;background:#00A6A044;border:1px solid #00A6A088}
    .user-arrow{position:absolute;left:13px;top:2px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:23px solid #007F7A;transform-origin:50% 19px;filter:drop-shadow(0 1px 1px #0006)}
    .user-center{position:absolute;left:14px;top:14px;width:14px;height:14px;border-radius:50%;border:3px solid white;background:#00A6A0;box-shadow:0 1px 5px #0007}
    .leaflet-div-icon{background:transparent;border:0}
    </style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
    const center=${JSON.stringify(center)};const stations=${JSON.stringify(stationData)};
    const map=L.map('map',{zoomControl:true,scrollWheelZoom:true,touchZoom:true}).setView(center,13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap contributors',maxZoom:19}).addTo(map);
    stations.forEach(s=>L.marker([s.latitude,s.longitude],{icon:L.divIcon({className:'',html:'<div class="police-pin" role="img" aria-label="Police station">👮</div>',iconSize:[38,38],iconAnchor:[19,19]})}).addTo(map).bindPopup('<b>'+s.name+'</b><br>Cyber police station'));
    let userMarker=null;
    window.updateUserMarker=(lat,lng,heading,centerOnUser)=>{
      const icon=L.divIcon({className:'',html:'<div class="user-pin"><div class="user-halo"></div><div class="user-arrow" style="transform:rotate('+(heading===null?0:heading)+'deg)"></div><div class="user-center"></div></div>',iconSize:[42,42],iconAnchor:[21,21]});
      if(userMarker){userMarker.setLatLng([lat,lng]);userMarker.setIcon(icon)}else{userMarker=L.marker([lat,lng],{icon,zIndexOffset:1000}).addTo(map).bindPopup('Your location and direction')}
      if(centerOnUser)map.setView([lat,lng],Math.max(map.getZoom(),15));
    };
    </script></body></html>`;
}
