import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { getTheaters, Theater } from '../../db/dao';
import { Ionicons } from '@expo/vector-icons';

export default function TheatersScreen() {
    const [theaters, setTheaters] = useState<Theater[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        getTheaters().then(setTheaters);
    }, []);

    const filteredTheaters = theaters.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search theaters by name or address..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#888" />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredTheaters}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="videocam" size={24} color="#e91e63" />
                            <Text style={styles.title}>{item.name}</Text>
                        </View>
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-outline" size={16} color="#666" style={{ marginTop: 2 }} />
                            <Text style={styles.address}>{item.address}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No theaters found</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginBottom: 15, borderRadius: 8, paddingHorizontal: 10, elevation: 2 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 40 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 1 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    title: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: '#333' },
    locationContainer: { flexDirection: 'row', alignItems: 'flex-start' },
    address: { fontSize: 14, color: '#666', marginLeft: 5, flex: 1, lineHeight: 20 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#666' }
});