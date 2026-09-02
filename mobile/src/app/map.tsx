import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

import WeatherMap from '../components/weatherMap';
import { getWeather } from '../api/api';
import { WeatherResponse } from '../api/weather';

export default function MapScreen() {
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [weather, setWeather] =
    useState<WeatherResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadLocationAndWeather = async () => {
      try {
        // 1. Request location permission
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setError('Location permission was denied.');
          return;
        }

        // 2. Get device location
        const currentLocation =
          await Location.getCurrentPositionAsync({});

        setLocation(currentLocation);

        const latitude =
          currentLocation.coords.latitude;

        const longitude =
          currentLocation.coords.longitude;

        console.log('Device latitude:', latitude);
        console.log('Device longitude:', longitude);

        // 3. Get weather for device location
        const weatherData =
          await getWeather(latitude, longitude);

        setWeather(weatherData);

        console.log(
          'Weather loaded for device location'
        );
      } catch (error) {
        console.error(
          'Error getting location/weather:',
          error
        );

        setError(
          'Unable to get location or weather.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadLocationAndWeather();
  }, []);

  // Loading state
  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>
          📍 Getting your location...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          ❌ {error}
        </Text>
      </View>
    );
  }

  // Location unavailable
  if (!location) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          ❌ Location not available
        </Text>
      </View>
    );
  }

  const latitude =
    location.coords.latitude;

  const longitude =
    location.coords.longitude;

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Weather Map
      </Text>

      <Text style={styles.coordinates}>
        Latitude: {latitude.toFixed(4)}
      </Text>

      <Text style={styles.coordinates}>
        Longitude: {longitude.toFixed(4)}
      </Text>

      {/* Map */}
      <WeatherMap
        latitude={latitude}
        longitude={longitude}
      />

      {/* Weather Information */}
      {weather && (
        <View style={styles.weatherCard}>

          <Text style={styles.weatherTitle}>
            🌦️ Weather at Your Location
          </Text>

          <Text style={styles.temperature}>
            {weather.current.temperature_2m}°C
          </Text>

          <Text style={styles.weatherText}>
            Feels like{' '}
            {weather.current.apparent_temperature}°C
          </Text>

          <Text style={styles.weatherText}>
            💧 Humidity:{' '}
            {weather.current.relative_humidity_2m}%
          </Text>

          <Text style={styles.weatherText}>
            🌧️ Rain:{' '}
            {weather.current.precipitation} mm
          </Text>

          <Text style={styles.weatherText}>
            💨 Wind:{' '}
            {weather.current.wind_speed_10m} km/h
          </Text>

        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  coordinates: {
    fontSize: 15,
    marginBottom: 4,
  },

  text: {
    fontSize: 18,
  },

  error: {
    fontSize: 16,
    textAlign: 'center',
  },

  weatherCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#eeeeee',
  },

  weatherTitle: {
    fontSize: 19,
    fontWeight: 'bold',
  },

  temperature: {
    marginTop: 10,
    fontSize: 36,
    fontWeight: 'bold',
  },

  weatherText: {
    marginTop: 7,
    fontSize: 15,
  },

});