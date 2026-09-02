import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';

import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import {
  checkBackendHealth,
  getWeather,
  searchLocation,
} from '../api/api';

import { WeatherResponse } from '../api/weather';

import HourlyWeatherCard from '../components/HourlyWeatherCard';
import ForecastCard from '../components/ForecastCard';


export default function HomeScreen() {

  // ==============================
  // STATE
  // ==============================

  const [weather, setWeather] =
    useState<WeatherResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [locationName, setLocationName] =
    useState('');

  const [searchedLocation, setSearchedLocation] =
    useState('');

  const [todayHours, setTodayHours] =
    useState<number[]>([]);

  const [forecastDays, setForecastDays] =
    useState<number[]>([]);


  // ==============================
  // LOCATION SEARCH
  // ==============================

  const handleLocationSearch = async () => {

    if (!locationName.trim()) {
      setError('Please enter a location.');
      return;
    }

    try {

      setLoading(true);
      setError(null);

      console.log(
        'Searching location:',
        locationName.trim()
      );

      // Search location name
      const location =
        await searchLocation(locationName.trim());

      console.log(
        'Location result:',
        location
      );

      // Check whether location was found
      if (
        location.latitude === undefined ||
        location.longitude === undefined
      ) {
        setError('Location not found.');
        return;
      }

      // Get weather using coordinates
      const weatherData =
        await getWeather(
          location.latitude,
          location.longitude
        );

      setWeather(weatherData);

      // Display location name
      setSearchedLocation(
        [
          location.name,
          location.admin1,
          location.country,
        ]
          .filter(Boolean)
          .join(', ')
      );

      // ==============================
      // TODAY'S HOURLY FORECAST
      // ==============================

      const today =
        weatherData.hourly.time[0].split('T')[0];

      const indexes =
        weatherData.hourly.time
          .map((time, index) => {

            if (time.startsWith(today)) {
              return index;
            }

            return -1;
          })
          .filter(
            (index) => index !== -1
          );

      setTodayHours(indexes);

      console.log(
        'Today hourly indexes:',
        indexes
      );


      // ==============================
      // 7-DAY FORECAST
      // ==============================

      const days =
        weatherData.daily.time.map(
          (_, index) => index
        );

      setForecastDays(days);

      console.log(
        '7-day forecast indexes:',
        days
      );

    } catch (error) {

      console.error(
        'Location search error:',
        error
      );

      setError(
        'Unable to find weather for this location.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==============================
  // INITIAL WEATHER LOAD
  // ==============================

  useEffect(() => {

    const loadData = async () => {

      try {

        // Check backend
        await checkBackendHealth();

        // Temporary initial location
        // Hyderabad is only the starting location.
        // User can search for any location afterward.
        const data =
          await getWeather(
            17.3850,
            78.4867
          );

        setWeather(data);

        setSearchedLocation(
          'Hyderabad, Telangana, India'
        );

        setError(null);


        // ==============================
        // TODAY'S HOURLY FORECAST
        // ==============================

        const today =
          data.hourly.time[0].split('T')[0];

        const indexes =
          data.hourly.time
            .map((time, index) => {

              if (time.startsWith(today)) {
                return index;
              }

              return -1;
            })
            .filter(
              (index) => index !== -1
            );

        setTodayHours(indexes);

        console.log(
          'Today hourly indexes:',
          indexes
        );


        // ==============================
        // 7-DAY FORECAST
        // ==============================

        const days =
          data.daily.time.map(
            (_, index) => index
          );

        setForecastDays(days);

        console.log(
          '7-day forecast indexes:',
          days
        );

      } catch (error) {

        console.error(
          'Error loading data:',
          error
        );

        setError(
          'Unable to load weather data'
        );

      } finally {

        setLoading(false);

      }
    };

    loadData();

  }, []);


  // ==============================
  // UI
  // ==============================

  return (

    <ScrollView
      contentContainerStyle={styles.container}
    >

      {/* ==============================
          TITLE
      ============================== */}

      <Text style={styles.title}>
        WeatherGPT
      </Text>

      <Text style={styles.subtitle}>
        Your AI Weather Assistant
      </Text>


      {/* ==============================
          LOCATION SEARCH
      ============================== */}

      <View style={styles.searchContainer}>

        <TextInput
          style={styles.input}
          placeholder="Enter any city, village or location"
          value={locationName}
          onChangeText={setLocationName}
          onSubmitEditing={handleLocationSearch}
          returnKeyType="search"
        />

        <Pressable
          style={styles.searchButton}
          onPress={handleLocationSearch}
        >

          <Text style={styles.searchButtonText}>
            🔍 Search Weather
          </Text>

        </Pressable>

      </View>


      {/* ==============================
          SELECTED LOCATION
      ============================== */}

      {searchedLocation !== '' && (

        <Text style={styles.locationText}>
          📍 Weather for {searchedLocation}
        </Text>

      )}


      {/* ==============================
          MAP BUTTON
      ============================== */}

      <Pressable
        style={styles.mapButton}
        onPress={() => router.push('/map')}
      >

        <Text style={styles.mapButtonText}>
          🗺️ Open Weather Map
        </Text>

      </Pressable>


      {/* ==============================
          WEATHER CARD
      ============================== */}

      <View style={styles.card}>

        <Text style={styles.cardTitle}>
          Current Weather
        </Text>


        {/* LOADING */}

        {loading ? (

          <Text style={styles.cardText}>
            ⏳ Loading weather...
          </Text>

        ) : error ? (

          /* ERROR */

          <Text style={styles.errorText}>
            ❌ {error}
          </Text>

        ) : weather ? (

          /* WEATHER */

          <View>

            {/* TEMPERATURE */}

            <Text style={styles.temperature}>
              {weather.current.temperature_2m}°C
            </Text>


            {/* FEELS LIKE */}

            <Text style={styles.weatherText}>
              Feels like{' '}
              {weather.current.apparent_temperature}°C
            </Text>


            {/* HUMIDITY */}

            <Text style={styles.weatherText}>
              💧 Humidity:{' '}
              {weather.current.relative_humidity_2m}%
            </Text>


            {/* PRECIPITATION */}

            <Text style={styles.weatherText}>
              🌧️ Precipitation:{' '}
              {weather.current.precipitation} mm
            </Text>


            {/* WIND */}

            <Text style={styles.weatherText}>
              💨 Wind:{' '}
              {weather.current.wind_speed_10m} km/h
            </Text>


            {/* ==============================
                HOURLY FORECAST
            ============================== */}

            <Text style={styles.hourlyTitle}>
              Hourly Forecast
            </Text>


            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.hourlyScroll}
            >

              {todayHours.map((index) => (

                <HourlyWeatherCard
                  key={index}
                  time={
                    weather.hourly.time[index]
                  }
                  temperature={
                    weather.hourly.temperature_2m[index]
                  }
                  precipitationProbability={
                    weather.hourly
                      .precipitation_probability[index]
                  }
                />

              ))}

            </ScrollView>


            {/* ==============================
                7-DAY FORECAST
            ============================== */}

            <Text style={styles.forecastTitle}>
              7-Day Forecast
            </Text>


            {forecastDays.map((index) => (

              <ForecastCard
                key={index}
                date={
                  weather.daily.time[index]
                }
                maxTemperature={
                  weather.daily
                    .temperature_2m_max[index]
                }
                minTemperature={
                  weather.daily
                    .temperature_2m_min[index]
                }
                precipitationProbability={
                  weather.daily
                    .precipitation_probability_max[index]
                }
              />

            ))}

          </View>

        ) : null}

      </View>

    </ScrollView>

  );
}


// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 18,
    marginTop: 8,
  },


  // ==============================
  // SEARCH
  // ==============================

  searchContainer: {
    marginTop: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },

  searchButton: {
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
  },

  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  locationText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },


  // ==============================
  // MAP
  // ==============================

  mapButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
  },

  mapButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },


  // ==============================
  // WEATHER CARD
  // ==============================

  card: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#eeeeee',
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  cardText: {
    marginTop: 8,
    fontSize: 15,
  },

  errorText: {
    marginTop: 8,
    fontSize: 15,
  },

  temperature: {
    marginTop: 12,
    fontSize: 40,
    fontWeight: 'bold',
  },

  weatherText: {
    marginTop: 8,
    fontSize: 16,
  },


  // ==============================
  // HOURLY
  // ==============================

  hourlyTitle: {
    marginTop: 20,
    marginBottom: 12,
    fontSize: 20,
    fontWeight: 'bold',
  },

  hourlyScroll: {
    marginHorizontal: -4,
  },


  // ==============================
  // 7-DAY FORECAST
  // ==============================

  forecastTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },

});
