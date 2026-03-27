import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import { getMoviesByStatus, Movie } from '../../db/dao';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';

const filterData = [
  { label: 'All Durations', value: 'all' },
  { label: 'Under 160 mins', value: 'under_160' },
  { label: '160 mins & Over', value: 'over_160' },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'Now Showing' | 'Coming Soon'>('Now Showing');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState('all');

  useEffect(() => {
    getMoviesByStatus(activeTab).then(setMovies);
  }, [activeTab]);

  let filteredMovies = movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
  
  if (durationFilter === 'under_160') {
    filteredMovies = filteredMovies.filter(m => m.duration < 160);
  } else if (durationFilter === 'over_160') {
    filteredMovies = filteredMovies.filter(m => m.duration >= 160);
  }

  const renderMovie = ({ item }: { item: Movie }) => (
    <TouchableOpacity style={styles.movieCard} onPress={() => router.push(`/movie/${item.id}`)}>
      <Image source={{ uri: item.posterUrl }} style={styles.poster} />
      <Text style={styles.movieTitle}>{item.title}</Text>
      <Text style={styles.movieInfo}>{item.duration} mins</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={filterData}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Filter"
          value={durationFilter}
          onChange={item => setDurationFilter(item.value)}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Now Showing' && styles.activeTab]}
          onPress={() => setActiveTab('Now Showing')}>
          <Text style={[styles.tabText, activeTab === 'Now Showing' && styles.activeTabText]}>Now Showing</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Coming Soon' && styles.activeTab]}
          onPress={() => setActiveTab('Coming Soon')}>
          <Text style={[styles.tabText, activeTab === 'Coming Soon' && styles.activeTabText]}>Coming Soon</Text>
        </TouchableOpacity>
      </View>
      <FlatList 
        data={filteredMovies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMovie}
        numColumns={2}
        contentContainerStyle={{ padding: 10 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No movies found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchRow: { flexDirection: 'row', padding: 10, paddingBottom: 0 },
  searchContainer: { flex: 2, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, elevation: 2, marginRight: 10 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45 },
  dropdown: { flex: 1, backgroundColor: '#fff', height: 45, borderRadius: 8, paddingHorizontal: 10, elevation: 2 },
  placeholderStyle: { fontSize: 14, color: '#888' },
  selectedTextStyle: { fontSize: 14, color: '#333' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2, marginTop: 10 },
  tab: { flex: 1, padding: 15, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#e91e63' },
  tabText: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  activeTabText: { color: '#e91e63' },
  movieCard: { flex: 1, margin: 8, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 2 },
  poster: { width: '100%', height: 250, resizeMode: 'cover' },
  movieTitle: { fontSize: 16, fontWeight: 'bold', margin: 8, color: '#333' },
  movieInfo: { fontSize: 14, color: '#666', marginLeft: 8, marginBottom: 8 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666' }
});
