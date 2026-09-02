import { View, Text, StyleSheet } from 'react-native';

interface HourlyWeatherCardProps {
  time: string;
  temperature: number;
  precipitationProbability: number;
}

export default function HourlyWeatherCard({
  time,
  temperature,
  precipitationProbability,
}: HourlyWeatherCardProps) {

  const formattedTime = new Date(time).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={styles.card}>

      <Text style={styles.time}>
        {formattedTime}
      </Text>

      <Text style={styles.temperature}>
        {temperature}°C
      </Text>

      <Text style={styles.rain}>
        🌧️ Rain {precipitationProbability}%
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 130,
    padding: 16,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
  },

  time: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  temperature: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: 'bold',
  },

  rain: {
    marginTop: 8,
    fontSize: 13,
  },
});