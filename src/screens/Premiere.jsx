import { AntDesign } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { BASE_URL } from '../apis'

export default function Premiere() {
     const navigation = useNavigation()
     const [data, setData] = useState([])
     const [loading, setLoading] = useState(true)
     const [favorites, setFavorites] = useState({})
     const [brands, setBrands] = useState([])
     const [selectedBrand, setSelectedBrand] = useState('All')
     // STATE SEARCH
     const [searchQuery, setSearchQuery] = useState('')
     const [isSearchFocused, setIsSearchFocused] = useState(false)

     const toggleFavorite = useCallback(async (item) => {
          try {
               const newFavorites = { ...favorites }
               const itemId = item._id || item.id

               if (newFavorites[itemId]) {
                    delete newFavorites[itemId]
               } else {
                    newFavorites[itemId] = item
               }
               setFavorites(newFavorites)
               await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites))
          } catch (error) {
               console.error(error)
          }
     }, [favorites])

     const loadFavorites = useCallback(async () => {
          try {
               const storedFavorites = await AsyncStorage.getItem('favorites')
               if (storedFavorites) {
                    const parsedFavorites = JSON.parse(storedFavorites)
                    setFavorites(parsedFavorites)
               } else {
                    setFavorites({})
               }
          } catch (error) {
               console.error("Error loading favorites:", error)
               setFavorites({})
          }
     }, [])

     const fetchData = useCallback(async () => {
          try {
               setLoading(true)
               await loadFavorites()
               const response = await fetch(BASE_URL, {
                    method: 'GET',
                    headers: { 'content-type': 'application/json' },
               })

               if (!response.ok) {
                    throw new Error('Network response was not ok');
               }

               const data = await response.json()
               setData(data)
               const allBrands = data.map(item => item.brand || 'Unknown')
               const uniqueBrands = ['All', ...Array.from(new Set(allBrands))]
               setBrands(uniqueBrands)
               setLoading(false)
          } catch (error) {
               console.error('Error fetching data:', error)
               setLoading(false)
               throw error
          }
     }, [loadFavorites])

     useEffect(() => {
          fetchData()
     }, [fetchData])

     useFocusEffect(
          useCallback(() => {
               loadFavorites()
          }, [loadFavorites])
     )

     // FUNCTION SEARCH
     const handleSearch = useCallback((text) => {
          setSearchQuery(text)
     }, [])

     const listFilter = data.filter(item => {
          const matchesBrand = selectedBrand === 'All' || item.brand === selectedBrand
          const matchesSearch = item.jeName.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesRequired = item.color.length > 1 && item.stoneStyle
          return matchesBrand && matchesSearch && matchesRequired
     })

     if (loading) {
          return (
               <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Loading data...</Text>
               </View>
          )
     }

     return (
          <ScrollView contentContainerStyle={styles.container}>
               {/* SEARCH BAR */}
               <View style={styles.searchContainer}>
                    <View style={[
                         styles.searchInputContainer,
                         isSearchFocused && styles.searchInputFocused
                    ]}>
                         <TextInput
                              style={styles.searchInput}
                              placeholder="Search"
                              value={searchQuery}
                              onChangeText={handleSearch}
                         />
                         {searchQuery !== '' && (
                              <TouchableOpacity
                                   onPress={() => setSearchQuery('')}
                                   style={styles.clearButton}
                              >
                                   <AntDesign name="close" size={16} color="#999" />
                              </TouchableOpacity>
                         )}
                    </View>
               </View>

               <View style={styles.brandContainer}>
                    {brands.map((brand) => (
                         <TouchableOpacity
                              key={brand}
                              onPress={() => setSelectedBrand(brand)}
                              style={[
                                   styles.brandButton,
                                   selectedBrand === brand && styles.brandButtonActive,
                              ]}
                         >
                              <Text
                                   style={{
                                        color: selectedBrand === brand ? '#fff' : '#000',
                                   }}
                              >
                                   {brand}
                              </Text>
                         </TouchableOpacity>
                    ))}
               </View>

               {listFilter && listFilter.length > 0 ? (
                    listFilter.sort((a, b) => b.percentOff - a.percentOff).map((item, index) => {
                         const itemId = item._id || item.id
                         const isFavorite = favorites[itemId]

                         return (
                              <Pressable
                                   key={index}
                                   style={styles.item}
                                   onPress={() => navigation.navigate('Detail', { item })}
                              >
                                   <View style={styles.imageContainer}>
                                        <Image
                                             style={styles.image}
                                             source={{
                                                  uri: item.image
                                             }}
                                        />
                                        <TouchableOpacity
                                             style={styles.favoriteButton}
                                             onPress={() => toggleFavorite(item)}
                                        >
                                             <AntDesign
                                                  name={isFavorite ? "heart" : "hearto"}
                                                  size={24}
                                                  color={isFavorite ? "#ff4757" : "#ffffff"}
                                             />
                                        </TouchableOpacity>
                                   </View>
                                   <Text style={styles.name}>{item?.jeName}</Text>
                                   <View style={styles.saleContainer}>
                                        <Text style={styles.saleText}>Sale: {(item?.percentOff * 100).toFixed(0)}%</Text>
                                   </View>
                              </Pressable>
                         )
                    })
               ) : (
                    <Text style={styles.emptyText}>No data available</Text>
               )}
          </ScrollView>
     )
}

const styles = StyleSheet.create({
     container: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          padding: 10,
          backgroundColor: '#f5f5f5'
     },
     searchContainer: {
          paddingHorizontal: 10,
          paddingBottom: 15,
          width: '100%'
     },
     searchInputContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: '#ddd'
     },
     searchInputFocused: {
          borderColor: '#007bff',
          shadowColor: '#007bff',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2
     },
     searchInput: {
          flex: 1,
          fontSize: 16,
          marginLeft: 8,
          color: '#333',
          height: 40
     },
     clearButton: {
          padding: 4
     },
     brandContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: 16,
     },
     brandButton: {
          padding: 10,
          backgroundColor: '#eee',
          borderRadius: 6,
          marginRight: 8,
          marginBottom: 8,
     },
     brandButtonActive: {
          backgroundColor: '#007bff',
     },
     item: {
          width: '48%',
          padding: 12,
          borderRadius: 10,
          marginBottom: 15,
          backgroundColor: '#fff',
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4
     },
     imageContainer: {
          position: 'relative',
          marginBottom: 10,
          borderRadius: 8,
          overflow: 'hidden'
     },
     image: {
          width: '100%',
          height: 150,
          borderRadius: 8
     },
     favoriteButton: {
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: 20,
          padding: 6,
          zIndex: 10
     },
     name: {
          fontWeight: '600',
          fontSize: 16,
          marginBottom: 6,
          color: '#333'
     },
     saleContainer: {
          backgroundColor: '#f1c40f',
          alignSelf: 'flex-start',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          marginTop: 4
     },
     saleText: {
          color: '#333',
          fontWeight: '700',
          fontSize: 12
     },
     centered: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5'
     },
     loadingText: {
          marginTop: 10,
          color: '#333',
          fontSize: 16
     },
     errorText: {
          color: '#e74c3c',
          fontSize: 16,
     },
     emptyText: {
          textAlign: 'center',
          marginTop: 20,
          fontSize: 16,
          color: '#666',
          width: '100%'
     }
     /* Style cho kết quả tìm kiếm trống (đã comment) */
     /* searchEmptyContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          width: '100%'
     },
     searchEmptyText: {
          fontSize: 16,
          color: '#666',
          textAlign: 'center'
     },
     searchEmptyIcon: {
          marginBottom: 12
     } */
})