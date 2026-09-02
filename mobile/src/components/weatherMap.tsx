import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface WeatherMapProps {
  latitude: number;
  longitude: number;
}

export default function WeatherMap({
  latitude,
  longitude,
}: WeatherMapProps) {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker
          coordinate={{
            latitude: latitude,
            longitude: longitude,
          }}
          title="Your Location"
          description="Current weather location"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 350,
    width: '100%',
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },

  map: {
    width: '100%',
    height: '100%',
  },
});