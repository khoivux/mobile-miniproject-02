import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getMovieById, getShowtimesByMovieId, Movie, ShowtimeWithTheater } from '../../db/dao';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<ShowtimeWithTheater[]>([]);

  useEffect(() => {
    if (id) {
      const movieId = Number(id);
      getMovieById(movieId).then(setMovie);
      getShowtimesByMovieId(movieId).then(setShowtimes);
    }
  }, [id]);

  if (!movie) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Image source={{ uri: movie.posterUrl }} style={styles.poster} />
      <View style={styles.content}>
        <Text style={styles.title}>{movie.title}</Text>
        <Text style={styles.duration}>{movie.duration} mins • {movie.status}</Text>
        <Text style={styles.desc}>{movie.description}</Text>
        
        <Text style={styles.sectionTitle}>Showtimes</Text>
        <FlatList
          data={showtimes}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          renderItem={({item}) => (
            <TouchableOpacity 
              style={styles.showtimeBtn}
              onPress={() => router.push(`/showtime/${item.id}`)}>
              <Text style={styles.timeText}>{item.start_time}</Text>
              <Text style={styles.theaterText}>{item.theater_name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  poster: { width: '100%', height: 300, resizeMode: 'cover' },
  content: { padding: 15, flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold' },
  duration: { fontSize: 14, color: '#666', marginVertical: 8 },
  desc: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  showtimeBtn: { 
    flex: 1, 
    margin: 5, 
    padding: 10, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 8, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  timeText: { fontSize: 16, fontWeight: 'bold', color: '#e91e63' },
  theaterText: { fontSize: 12, color: '#555', marginTop: 4, textAlign: 'center' }
});
