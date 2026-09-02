import { View, Text, StyleSheet } from 'react-native';

interface ForecastCardProps {
  date: string;
  maxTemperature: number;
  minTemperature: number;
  precipitationProbability: number;
}

export default function ForecastCard({
  date,
  maxTemperature,
  minTemperature,
  precipitationProbability,
}: ForecastCardProps) {

  const formattedDate = new Date(date).toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <View style={styles.card}>

      <Text style={styles.date}>
        {formattedDate}
      </Text>

      <Text style={styles.temperature}>
        {maxTemperature}°C / {minTemperature}°C
      </Text>

      <Text style={styles.rain}>
        🌧️ Rain {precipitationProbability}%
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#eeeeee',
  },

  date: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  temperature: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },

  rain: {
    marginTop: 8,
    fontSize: 14,
  },
});