import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { getTicketsByUserId, TicketDetails } from '../../db/dao';
import { useAuthStore } from '../../store/useAuthStore';
import { router, useFocusEffect } from 'expo-router';

export default function TicketsScreen() {
    const user = useAuthStore(state => state.user);
    const [tickets, setTickets] = useState<TicketDetails[]>([]);

    useFocusEffect(
        useCallback(() => {
            if (user) {
                getTicketsByUserId(user.id).then(setTickets);
            } else {
                setTickets([]);
            }
        }, [user])
    );

    if (!user) {
        return (
            <View style={styles.center}>
                <Text style={styles.info}>Please login to view your tickets</Text>
                <Button title="Login" onPress={() => router.push('/login')} color="#e91e63" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {tickets.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.info}>You have no booked tickets yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={tickets}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.movieTitle}>{item.movie_title}</Text>
                            <Text style={styles.detail}>Theater: {item.theater_name}</Text>
                            <Text style={styles.detail}>Showtime: {item.start_time} - {item.room}</Text>
                            <Text style={styles.seat}>Seat: {item.seat_number}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    info: { fontSize: 16, marginBottom: 20 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
    movieTitle: { fontSize: 18, fontWeight: 'bold', color: '#e91e63', marginBottom: 5 },
    detail: { fontSize: 14, color: '#444', marginBottom: 3 },
    seat: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 5 }
});