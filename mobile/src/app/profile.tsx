import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { getUser } from '../api/api';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUser(3);
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {loading ? (
        <Text style={styles.text}>Loading profile...</Text>
      ) : user ? (
        <>
          <Text style={styles.text}>
            Name: {user.name}
          </Text>

          <Text style={styles.text}>
            Profession: {user.profession}
          </Text>

          <Text style={styles.text}>
            Language: {user.language}
          </Text>
        </>
      ) : (
        <Text style={styles.text}>
          Failed to load profile
        </Text>
      )}
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
    marginBottom: 25,
  },

  text: {
    fontSize: 17,
    marginBottom: 12,
  },
});