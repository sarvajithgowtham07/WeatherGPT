import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { getWeather } from "../api/api";
import { useLanguage } from "../i18n/LanguageContext";

type WeatherData = {
  latitude: number;
  longitude: number;
  timezone: string;

  current: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };

  hourly: {
    time?: string[];
    temperature_2m?: number[];
    precipitation_probability?: number[];
    weather_code?: number[];
  };

  daily: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
    weather_code?: number[];
  };
};

type WeatherIconName =
  | "sunny-outline"
  | "partly-sunny-outline"
  | "cloud-outline"
  | "rainy-outline"
  | "snow-outline"
  | "thunderstorm-outline"
  | "help-circle-outline";

function getWeatherDescription(
  code: number | undefined,
  t: any
) {
  if (code === undefined) {
    return t.weatherCondition;
  }

  if (code === 0) {
    return t.clearSky;
  }

  if ([1, 2, 3].includes(code)) {
    return t.partlyCloudy;
  }

  if ([45, 48].includes(code)) {
    return t.fog;
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return t.drizzle;
  }

  if ([61, 63, 65, 66, 67].includes(code)) {
    return t.rain;
  }

  if ([71, 73, 75, 77].includes(code)) {
    return t.snow;
  }

  if ([80, 81, 82].includes(code)) {
    return t.rainShowers;
  }

  if ([85, 86].includes(code)) {
    return t.snowShowers;
  }

  if ([95, 96, 99].includes(code)) {
    return t.thunderstorm;
  }

  return t.weatherCondition;
}

function getWeatherIcon(
  code?: number
): WeatherIconName {
  if (code === undefined) {
    return "help-circle-outline";
  }

  if (code === 0) {
    return "sunny-outline";
  }

  if ([1, 2, 3].includes(code)) {
    return "partly-sunny-outline";
  }

  if ([45, 48].includes(code)) {
    return "cloud-outline";
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return "rainy-outline";
  }

  if ([61, 63, 65, 66, 67].includes(code)) {
    return "rainy-outline";
  }

  if ([71, 73, 75, 77].includes(code)) {
    return "snow-outline";
  }

  if ([80, 81, 82].includes(code)) {
    return "rainy-outline";
  }

  if ([85, 86].includes(code)) {
    return "snow-outline";
  }

  if ([95, 96, 99].includes(code)) {
    return "thunderstorm-outline";
  }

  return "cloud-outline";
}

function formatHour(time?: string) {
  if (!time) return "--";

  const date = new Date(time);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDay(
  time?: string,
  language?: string
) {
  if (!time) return "--";

  const date = new Date(time);

  let locale = "en-IN";

  if (language === "Hindi") locale = "hi-IN";
  if (language === "Telugu") locale = "te-IN";
  if (language === "Tamil") locale = "ta-IN";
  if (language === "Kannada") locale = "kn-IN";
  if (language === "Marathi") locale = "mr-IN";

  return date.toLocaleDateString(locale, {
    weekday: "short",
  });
}

export default function DashboardScreen() {
  const { t, language } = useLanguage();

  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadWeather = useCallback(async () => {
    try {
      setError("");

      /*
       * Temporary coordinates for testing.
       * Later these can be replaced with
       * saved user location / GPS.
       */
      const latitude = 17.3850;
      const longitude = 78.4867;

      const response = await getWeather(
        latitude,
        longitude
      );

      setWeather(response);
    } catch (err) {
      console.error(
        "Dashboard weather error:",
        err
      );

      setError(
        t.unableLoadWeather
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadWeather();
  };

  /*
   * LOADING
   */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          {t.loading}
        </Text>
      </View>
    );
  }

  /*
   * ERROR
   */

  if (error || !weather) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="cloud-offline-outline"
          size={55}
          style={styles.errorIcon}
        />

        <Text style={styles.errorTitle}>
          {t.weatherUnavailable}
        </Text>

        <Text style={styles.errorText}>
          {error ||
            t.unableToGetWeather}
        </Text>

        <Text
          style={styles.retryText}
          onPress={loadWeather}
        >
          {t.tapToRetry}
        </Text>
      </View>
    );
  }

  const current = weather.current || {};
  const hourly = weather.hourly || {};
  const daily = weather.daily || {};

  const hourlyTimes =
    hourly.time || [];

  const hourlyTemperatures =
    hourly.temperature_2m || [];

  const hourlyRain =
    hourly.precipitation_probability || [];

  const hourlyCodes =
    hourly.weather_code || [];

  const dailyTimes =
    daily.time || [];

  const dailyMax =
    daily.temperature_2m_max || [];

  const dailyMin =
    daily.temperature_2m_min || [];

  const dailyRain =
    daily.precipitation_probability_max || [];

  const dailyCodes =
    daily.weather_code || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >

      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>

          <Text style={styles.title}>
            WeatherGPT
          </Text>

          <View style={styles.locationRow}>

            <Ionicons
              name="location-outline"
              size={15}
              style={styles.locationIcon}
            />

            <Text style={styles.subtitle}>
              {weather.timezone ||
                t.location}
            </Text>

          </View>

        </View>

        <View
          style={styles.headerIconContainer}
        >
          <Ionicons
            name="partly-sunny-outline"
            size={30}
            style={styles.headerWeatherIcon}
          />
        </View>
      </View>

      {/* CURRENT WEATHER */}

      <View style={styles.currentCard}>

        <View style={styles.currentTop}>

          <View>

            <Text style={styles.currentLabel}>
              {t.currentWeather}
            </Text>

            <Text style={styles.temperature}>
              {current.temperature_2m ?? "--"}°
            </Text>

            <Text style={styles.description}>
              {getWeatherDescription(
                current.weather_code,
                t
              )}
            </Text>

            <Text style={styles.feelsLike}>
              {t.feelsLike}{" "}
              {current.apparent_temperature ??
                "--"}
              °
            </Text>

          </View>

          <Ionicons
            name={getWeatherIcon(
              current.weather_code
            )}
            size={75}
            style={styles.currentWeatherIcon}
          />

        </View>

        {/* WEATHER STATS */}

        <View style={styles.statsRow}>

          <View style={styles.stat}>

            <View
              style={styles.statIconContainer}
            >
              <Ionicons
                name="water-outline"
                size={21}
                style={styles.statIcon}
              />
            </View>

            <Text style={styles.statValue}>
              {current.relative_humidity_2m ??
                "--"}%
            </Text>

            <Text style={styles.statLabel}>
              {t.humidity}
            </Text>

          </View>

          <View style={styles.stat}>

            <View
              style={styles.statIconContainer}
            >
              <Ionicons
                name="rainy-outline"
                size={21}
                style={styles.statIcon}
              />
            </View>

            <Text style={styles.statValue}>
              {current.precipitation ??
                "--"} mm
            </Text>

            <Text style={styles.statLabel}>
              {t.rain}
            </Text>

          </View>

          <View style={styles.stat}>

            <View
              style={styles.statIconContainer}
            >
              <Ionicons
                name="speedometer-outline"
                size={21}
                style={styles.statIcon}
              />
            </View>

            <Text style={styles.statValue}>
              {current.wind_speed_10m ??
                "--"}
            </Text>

            <Text style={styles.statLabel}>
              {t.windSpeed} km/h
            </Text>

          </View>

        </View>
      </View>

      {/* HOURLY FORECAST */}

      <View style={styles.section}>

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            {t.hourlyForecast}
          </Text>

          <Ionicons
            name="time-outline"
            size={20}
            style={styles.sectionIcon}
          />

        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.horizontalList
          }
        >

          {hourlyTimes
            .slice(0, 12)
            .map((time, index) => (

              <View
                style={[
                  styles.hourCard,
                  index === 0 &&
                    styles.currentHourCard,
                ]}
                key={`${time}-${index}`}
              >

                <Text style={styles.hourText}>
                  {index === 0
                    ? t.now
                    : formatHour(time)}
                </Text>

                <Ionicons
                  name={getWeatherIcon(
                    hourlyCodes[index]
                  )}
                  size={29}
                  style={styles.hourWeatherIcon}
                />

                <Text
                  style={styles.hourTemperature}
                >
                  {hourlyTemperatures[index] ??
                    "--"}°
                </Text>

                <View
                  style={styles.rainProbability}
                >

                  <Ionicons
                    name="water-outline"
                    size={12}
                    style={
                      styles.rainProbabilityIcon
                    }
                  />

                  <Text
                    style={
                      styles.rainProbabilityText
                    }
                  >
                    {hourlyRain[index] ?? 0}%
                  </Text>

                </View>

              </View>

            ))}

        </ScrollView>
      </View>

      {/* 7 DAY FORECAST */}

      <View style={styles.section}>

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            {t.sevenDayForecast}
          </Text>

          <Ionicons
            name="calendar-outline"
            size={20}
            style={styles.sectionIcon}
          />

        </View>

        <View style={styles.forecastCard}>

          {dailyTimes
            .slice(0, 7)
            .map((time, index) => (

              <View
                style={[
                  styles.dayRow,
                  index !== 0 &&
                    styles.dayRowBorder,
                ]}
                key={`${time}-${index}`}
              >

                <Text style={styles.dayName}>
                  {index === 0
                    ? t.today
                    : formatDay(
                        time,
                        language
                      )}
                </Text>

                <Ionicons
                  name={getWeatherIcon(
                    dailyCodes[index]
                  )}
                  size={25}
                  style={styles.dayWeatherIcon}
                />

                <View style={styles.dayRain}>

                  <Ionicons
                    name="water-outline"
                    size={13}
                    style={styles.dayRainIcon}
                  />

                  <Text
                    style={styles.dayRainText}
                  >
                    {dailyRain[index] ?? 0}%
                  </Text>

                </View>

                <Text
                  style={styles.dayTemperature}
                >
                  {dailyMax[index] ?? "--"}° /{" "}
                  {dailyMin[index] ?? "--"}°
                </Text>

              </View>

            ))}

        </View>
      </View>

      {/* AI CARD */}

      <View style={styles.aiCard}>

        <View style={styles.aiTitleRow}>

          <View style={styles.aiIconContainer}>

            <Ionicons
              name="sparkles-outline"
              size={20}
              style={styles.aiIcon}
            />

          </View>

          <Text style={styles.aiTitle}>
            {t.aiWeatherAssistant}
          </Text>

        </View>

        <Text style={styles.aiText}>
          {t.aiWeatherDescription}
        </Text>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#f5f7fb",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },

  errorIcon: {
    marginBottom: 15,
    opacity: 0.6,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },

  errorText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.7,
  },

  retryText: {
    fontSize: 16,
    fontWeight: "700",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  headerLeft: {
    flex: 1,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  locationIcon: {
    marginRight: 4,
    opacity: 0.6,
  },

  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },

  headerIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    elevation: 2,
  },

  headerWeatherIcon: {
    opacity: 0.75,
  },

  currentCard: {
    borderRadius: 26,
    padding: 24,
    backgroundColor: "#ffffff",
    marginBottom: 26,
    elevation: 3,
  },

  currentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  currentLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    opacity: 0.5,
  },

  temperature: {
    fontSize: 64,
    fontWeight: "800",
    marginTop: 5,
  },

  description: {
    fontSize: 21,
    fontWeight: "600",
  },

  feelsLike: {
    marginTop: 5,
    fontSize: 14,
    opacity: 0.6,
  },

  currentWeatherIcon: {
    opacity: 0.8,
    marginRight: 8,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },

  stat: {
    alignItems: "center",
    flex: 1,
  },

  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
    marginBottom: 7,
  },

  statIcon: {
    opacity: 0.7,
  },

  statValue: {
    fontSize: 15,
    fontWeight: "700",
  },

  statLabel: {
    fontSize: 11,
    opacity: 0.55,
    marginTop: 3,
  },

  section: {
    marginBottom: 26,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },

  sectionIcon: {
    opacity: 0.55,
  },

  horizontalList: {
    gap: 10,
  },

  hourCard: {
    width: 92,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    elevation: 2,
  },

  currentHourCard: {
    borderWidth: 1,
    borderColor: "#dddddd",
  },

  hourText: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.65,
  },

  hourWeatherIcon: {
    marginVertical: 10,
    opacity: 0.75,
  },

  hourTemperature: {
    fontSize: 18,
    fontWeight: "800",
  },

  rainProbability: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  rainProbabilityIcon: {
    marginRight: 3,
    opacity: 0.55,
  },

  rainProbabilityText: {
    fontSize: 11,
    opacity: 0.65,
  },

  forecastCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 16,
    elevation: 2,
  },

  dayRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
  },

  dayRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },

  dayName: {
    width: 70,
    fontSize: 14,
    fontWeight: "700",
  },

  dayWeatherIcon: {
    width: 45,
    opacity: 0.75,
  },

  dayRain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  dayRainIcon: {
    marginRight: 3,
    opacity: 0.55,
  },

  dayRainText: {
    fontSize: 12,
    opacity: 0.65,
  },

  dayTemperature: {
    fontSize: 14,
    fontWeight: "700",
  },

  aiCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    elevation: 2,
  },

  aiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  aiIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
    marginRight: 10,
  },

  aiIcon: {
    opacity: 0.75,
  },

  aiTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  aiText: {
    fontSize: 14,
    lineHeight: 21,
    opacity: 0.7,
  },
});