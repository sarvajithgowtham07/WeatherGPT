import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

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
          latitude,
          longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        mapType="standard"
      >
        <Marker
          coordinate={{
            latitude,
            longitude,
          }}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 350,
    marginTop: 20,
    overflow: "hidden",
    borderRadius: 16,
  },

  map: {
    width: "100%",
    height: "100%",
  },
});