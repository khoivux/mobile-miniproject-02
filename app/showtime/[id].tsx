import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getShowtimeById, getBookedSeatsByShowtime, bookTicket, ShowtimeWithTheater } from '../../db/dao';
import { useAuthStore } from '../../store/useAuthStore';

const SEATS = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4'];

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const user = useAuthStore(state => state.user);
  const [showtime, setShowtime] = useState<ShowtimeWithTheater | null>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const showtimeId = Number(id);
      getShowtimeById(showtimeId).then(setShowtime);
      getBookedSeatsByShowtime(showtimeId).then(setBookedSeats);
    }
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      Alert.alert('Login Required', 'You must be logged in to book tickets.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') }
      ]);
      return;
    }
    if (!selectedSeat) {
      Alert.alert('Error', 'Please select a seat');
      return;
    }
    try {
      if (showtime) {
        await bookTicket(user.id, showtime.id, selectedSeat);
        Alert.alert('Success', 'Ticket booked successfully!', [
          { text: 'OK', onPress: () => {
              if (router.canGoBack()) router.back();
              else router.replace('/(tabs)/tickets');
          }}
        ]);
      }
    } catch(e) {
      Alert.alert('Error', 'Failed to book ticket');
    }
  };

  if (!showtime) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{showtime.theater_name}</Text>
        <Text style={styles.subtitle}>{showtime.theater_address}</Text>
        <Text style={styles.info}>{showtime.start_time} • {showtime.room}</Text>
        <Text style={styles.price}>{showtime.price.toLocaleString()} VND</Text>
      </View>

      <View style={styles.screenIndicator}>
        <Text style={styles.screenText}>SCREEN</Text>
      </View>

      <View style={styles.seatContainer}>
        {SEATS.map(seat => {
          const isBooked = bookedSeats.includes(seat);
          const isSelected = selectedSeat === seat;
          return (
            <TouchableOpacity 
              key={seat}
              style={[
                styles.seat,
                isBooked ? styles.seatBooked : isSelected ? styles.seatSelected : styles.seatAvailable
              ]}
              disabled={isBooked}
              onPress={() => setSelectedSeat(seat)}
            >
              <Text style={[styles.seatText, (isBooked || isSelected) && styles.seatTextLight]}>{seat}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity 
        style={[styles.bookBtn, !selectedSeat && styles.bookBtnDisabled]}
        disabled={!selectedSeat}
        onPress={handleBook}
      >
        <Text style={styles.bookBtnText}>Book Ticket</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  info: { fontSize: 16, marginTop: 10 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#e91e63', marginTop: 10 },
  screenIndicator: { backgroundColor: '#ccc', padding: 5, alignItems: 'center', marginBottom: 30, borderRadius: 5, width: '100%' },
  screenText: { letterSpacing: 5, fontWeight: 'bold', color: '#555' },
  seatContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, marginBottom: 40 },
  seat: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  seatAvailable: { backgroundColor: '#e0e0e0', borderWidth: 1, borderColor: '#ccc' },
  seatBooked: { backgroundColor: '#999' },
  seatSelected: { backgroundColor: '#e91e63' },
  seatText: { fontWeight: 'bold', color: '#333' },
  seatTextLight: { color: '#fff' },
  bookBtn: { backgroundColor: '#e91e63', padding: 15, alignItems: 'center', borderRadius: 8 },
  bookBtnDisabled: { backgroundColor: '#f48fb1' },
  bookBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
