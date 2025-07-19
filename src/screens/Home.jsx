import { AntDesign } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { BASE_URL } from '../apis'

export default function Home() {
     const navigation = useNavigation()
     const [data, setData] = useState([])
     const [loading, setLoading] = useState(true)
     const [favorites, setFavorites] = useState({})
     const [categories, setCategories] = useState([])
     const [selectedCategory, setSelectedCategory] = useState('All')
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
                    throw new Error('Network response was not ok')
               }

               const result = await response.json()
               setData(result)

// Lấy tất cả categories từ dữ liệu
               const allCategories = result.map(item => item.brand || 'Unknown')
               const uniqueCategories = ['All', ...Array.from(new Set(allCategories))]
               setCategories(uniqueCategories)

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

// Lọc dữ liệu theo category và từ khóa tìm kiếm
     const filteredItems = data.filter(item => {
// Kiểm tra xem item có phù hợp với category đã chọn (Sửa item.brand)
          const matchesCategory = selectedCategory === 'All' || item.brand === selectedCategory

// Kiểm tra xem item có chứa từ khóa tìm kiếm
          const matchesSearch = !searchQuery ||
               (item.jeName && item.jeName.toLowerCase().includes(searchQuery.toLowerCase()))

          return matchesCategory && matchesSearch
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
               {/* <View style={styles.searchContainer}>
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
               </View> */}

{/* CATEGORY FILTER */}
               <View style={styles.filterContainer}>
                    {categories.map((category) => (
                         <TouchableOpacity
                              key={category}
                              onPress={() => setSelectedCategory(category)}
                              style={[
                                   styles.filterButton,
                                   selectedCategory === category && styles.filterButtonActive,
                              ]}
                         >
                              <Text style={{
                                   color: selectedCategory === category ? '#fff' : '#000',
                              }}>
                                   {category}
                              </Text>
                         </TouchableOpacity>
                    ))}
               </View>

{/*DISPLAY ITEMS*/}
               {filteredItems && filteredItems.length > 0 ? (
                    filteredItems.sort((a, b) => b.percentOff - a.percentOff).map((item, index) => {
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
{/*ITEM DETAILS*/}
{/* NAME: */}
                                   <Text style={styles.name}>{item?.jeName}</Text>
                                   <View style={styles.saleContainer}>
{/* SALE: */}
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
     filterContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: 16,
     },
     filterButton: {
          padding: 10,
          backgroundColor: '#eee',
          borderRadius: 6,
          marginRight: 8,
          marginBottom: 8,
     },
     filterButtonActive: {
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