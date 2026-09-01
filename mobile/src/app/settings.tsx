import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/profile')}
      >
        <Text style={styles.buttonText}>Profile & Profession</Text>
      </Pressable>

      <View style={styles.card}>
        <Text>App settings will be added later.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#eeeeee',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  card: {
    marginTop: 20,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#eeeeee',
  },
});