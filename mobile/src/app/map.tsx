import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import * as Location from "expo-location";

import WeatherMap from "../components/weatherMap";
import { getWeather } from "../api/api";
import { WeatherResponse } from "../api/weather";
import { useLanguage } from "../i18n/LanguageContext";

export default function MapScreen() {
  const { t } = useLanguage();

  const [location, setLocation] =
    useState<Location.LocationObject | null>(
      null
    );

  const [weather, setWeather] =
    useState<WeatherResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadLocationAndWeather =
      async () => {
        try {
          const { status } =
            await Location.requestForegroundPermissionsAsync();

          if (status !== "granted") {
            setError(
              t.locationPermissionDenied
            );
            return;
          }

          const currentLocation =
            await Location.getCurrentPositionAsync(
              {}
            );

          setLocation(currentLocation);

          const latitude =
            currentLocation.coords.latitude;

          const longitude =
            currentLocation.coords.longitude;

          const weatherData =
            await getWeather(
              latitude,
              longitude
            );

          setWeather(weatherData);
        } catch (error) {
          console.error(
            "Error getting location/weather:",
            error
          );

          setError(
            t.locationWeatherError
          );
        } finally {
          setLoading(false);
        }
      };

    loadLocationAndWeather();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>
          📍 {t.gettingLocation}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          ❌ {error}
        </Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          ❌ {t.locationNotAvailable}
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
        {t.weatherMap}
      </Text>

      <Text style={styles.coordinates}>
        {t.latitude}: {latitude.toFixed(4)}
      </Text>

      <Text style={styles.coordinates}>
        {t.longitude}: {longitude.toFixed(4)}
      </Text>

      <WeatherMap
        latitude={latitude}
        longitude={longitude}
      />

      {weather && (
        <View style={styles.weatherCard}>
          <Text style={styles.weatherTitle}>
            🌦️ {t.weatherAtLocation}
          </Text>

          <Text style={styles.temperature}>
            {weather.current.temperature_2m}°C
          </Text>

          <Text style={styles.weatherText}>
            {t.feelsLike}{" "}
            {weather.current.apparent_temperature}°C
          </Text>

          <Text style={styles.weatherText}>
            💧 {t.humidity}:{" "}
            {weather.current.relative_humidity_2m}%
          </Text>

          <Text style={styles.weatherText}>
            🌧️ {t.rain}:{" "}
            {weather.current.precipitation} mm
          </Text>

          <Text style={styles.weatherText}>
            💨 {t.wind}:{" "}
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
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
    textAlign: "center",
  },

  weatherCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#eeeeee",
  },

  weatherTitle: {
    fontSize: 19,
    fontWeight: "bold",
  },

  temperature: {
    marginTop: 10,
    fontSize: 36,
    fontWeight: "bold",
  },

  weatherText: {
    marginTop: 7,
    fontSize: 15,
  },
});