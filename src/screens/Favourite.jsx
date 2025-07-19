import { AntDesign } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function Favourite() {
     const navigation = useNavigation()
     const [items, setItems] = useState([])
     const [loading, setLoading] = useState(true)
     const [favorites, setFavorites] = useState({})
     const [selectedItems, setSelectedItems] = useState({})
     const [isSelectionMode, setIsSelectionMode] = useState(false)
     const [selectAll, setSelectAll] = useState(false)
     const [categories, setCategories] = useState([])
     // const [selectedCategory, setSelectedCategory] = useState('All')

     const toggleFavorite = useCallback(async (item) => {
          try {
               // Cập nhật trạng thái yêu thích
               const newFavorites = { ...favorites }
               const itemId = item._id || item.id

               if (newFavorites[itemId]) {
                    delete newFavorites[itemId]
                    Alert.alert("Deselected", "Unchecked from favorites list")
               } else {
                    newFavorites[itemId] = item
               }

               // Cập nhật state và lưu vào AsyncStorage
               setFavorites(newFavorites)
               setItems(Object.values(newFavorites))
               await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites))
          } catch (error) {
               console.error(error)
          }
     }, [favorites])

     const toggleSelection = useCallback((itemId) => {
          // Cập nhật danh sách các item được chọn
          setSelectedItems(prev => {
               const newSelected = { ...prev }
               if (newSelected[itemId]) {
                    delete newSelected[itemId]
               } else {
                    newSelected[itemId] = true
               }
               return newSelected
          })
     }, [])

     const toggleSelectionMode = useCallback(() => {
          // Bật/tắt chế độ chọn nhiều
          setIsSelectionMode(prev => {
               const newMode = !prev
               // Nếu tắt chế độ chọn, reset lại danh sách chọn
               if (!newMode) {
                    setSelectedItems({})
                    setSelectAll(false)
               }
               return newMode
          })
     }, [])

     const handleSelectAll = useCallback(() => {
          // Chọn tất cả hoặc bỏ chọn tất cả
          if (selectAll) {
               // Bỏ chọn tất cả
               setSelectedItems({})
               setSelectAll(false)
          } else {
               // Chọn tất cả item đang hiển thị
               const newSelectedItems = {}
               filteredItems.forEach(item => {
                    const itemId = item._id || item.id
                    newSelectedItems[itemId] = true
               })
               setSelectedItems(newSelectedItems)
               setSelectAll(true)
          }
     }, [selectAll, filteredItems])

     const deleteSelectedItems = useCallback(async () => {
          try {
               // Kiểm tra xem có item nào được chọn không
               const selectedCount = Object.keys(selectedItems).length
               if (selectedCount === 0) return

               // Hiển thị dialog xác nhận xóa
               Alert.alert(
                    "Confirm",
                    `Are you sure you want to deselect ${selectedCount}?`,
                    [
                         {
                              text: "Cancel",
                              style: "cancel"
                         },
                         {
                              text: "Delete",
                              style: "destructive",
                              onPress: async () => {
                                   // Xóa các item được chọn
                                   const newFavorites = { ...favorites }
                                   Object.keys(selectedItems).forEach(itemId => {
                                        delete newFavorites[itemId]
                                   })

                                   // Cập nhật state và lưu vào AsyncStorage
                                   setFavorites(newFavorites)
                                   setItems(Object.values(newFavorites))
                                   setSelectedItems({})
                                   setSelectAll(false)
                                   await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites))
                                   Alert.alert("Success", "Unchecked successfully")
                              }
                         }
                    ]
               )
          } catch (error) {
               console.error(error)
          }
     }, [favorites, selectedItems])

     const loadFavorites = useCallback(async () => {
          try {
               setLoading(true)
               // Lấy dữ liệu yêu thích từ AsyncStorage
               const storedFavorites = await AsyncStorage.getItem('favorites')
               if (storedFavorites) {
                    // Parse dữ liệu và cập nhật state
                    const parsedFavorites = JSON.parse(storedFavorites)
                    setFavorites(parsedFavorites)
                    const favoriteItemsArray = Object.values(parsedFavorites)
                    setItems(favoriteItemsArray)

                    // Trích xuất danh sách categories từ dữ liệu yêu thích
                    const allCategories = favoriteItemsArray.map(item => item.brand || 'Unknown')
                    const uniqueCategories = ['All', ...Array.from(new Set(allCategories))]
                    setCategories(uniqueCategories)
               } else {
                    // Khởi tạo trạng thái mặc định nếu không có dữ liệu
                    setFavorites({})
                    setItems([])
                    setCategories(['All'])
               }
               setLoading(false)
          } catch (error) {
               console.error('Error loading favorites:', error)
               // Xử lý lỗi và set trạng thái mặc định
               setFavorites({})
               setItems([])
               setCategories(['All'])
               setLoading(false)
          }
     }, [])

     useEffect(() => {
          // Load dữ liệu yêu thích khi component được mount
          loadFavorites()
     }, [loadFavorites])

     useFocusEffect(
          useCallback(() => {
               // Load lại dữ liệu và reset chế độ chọn khi màn hình được focus
               loadFavorites()
               setIsSelectionMode(false)
               setSelectedItems({})
               setSelectAll(false)
          }, [loadFavorites])
     )

     // FUNCTION TO FILTER ITEMS
     // Lọc dữ liệu hiển thị (hiện tại hiển thị tất cả items)
     const filteredItems = items

     if (loading) {
          return (
               <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Loading...</Text>
               </View>
          )
     }

     return (
          <View style={styles.screenContainer}>
               {/* HEADER WITH ACTION BUTTONS */}
               <View style={styles.header}>
                    {items.length > 0 && (
                         <View style={styles.headerActions}>
                              {!isSelectionMode ? (
                                   <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={toggleSelectionMode}
                                   >
                                        <Text style={styles.actionButtonText}>Select</Text>
                                   </TouchableOpacity>
                              ) : (
                                   <>
                                        <TouchableOpacity
                                             style={styles.actionButton}
                                             onPress={handleSelectAll}
                                        >
                                             <Text style={styles.actionButtonText}>
                                                  {selectAll ? "Deselect all" : "Select all"}
                                             </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                             style={[
                                                  styles.actionButton,
                                                  styles.deleteButton,
                                                  Object.keys(selectedItems).length === 0 && styles.disabledButton
                                             ]}
                                             disabled={Object.keys(selectedItems).length === 0}
                                             onPress={deleteSelectedItems}
                                        >
                                             <Text style={styles.deleteButtonText}>Delete</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                             style={styles.actionButton}
                                             onPress={toggleSelectionMode}
                                        >
                                             <Text style={styles.actionButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                   </>
                              )}
                         </View>
                    )}
               </View>

               {/* ITEM LIST */}
               <ScrollView contentContainerStyle={styles.container}>
                    {filteredItems.length > 0 ? (
                         filteredItems.sort((a, b) => b.percentOff - a.percentOff).map((item) => {
                              const itemId = item._id || item.id

                              return (
                                   <Pressable
                                        key={itemId}
                                        style={[
                                             styles.item,
                                             isSelectionMode && selectedItems[itemId] && styles.selectedItem
                                        ]}
                                        onPress={() => {
                                             if (isSelectionMode) {
                                                  toggleSelection(itemId)
                                             } else {
                                                  navigation.navigate('Detail', { item })
                                             }
                                        }}
                                        onLongPress={() => {
                                             if (!isSelectionMode) {
                                                  toggleSelectionMode()
                                                  toggleSelection(itemId)
                                             }
                                        }}
                                   >
                                        <View style={styles.imageContainer}>
                                             <Image
                                                  style={styles.image}
                                                  source={{
                                                       uri: item.image
                                                  }}
                                             />
                                             {isSelectionMode ? (
                                                  <View style={styles.checkboxContainer}>
                                                       <View style={[
                                                            styles.checkbox,
                                                            selectedItems[itemId] && styles.checkboxSelected
                                                       ]}>
                                                            {selectedItems[itemId] && (
                                                                 <Text style={styles.checkmark}>✓</Text>
                                                            )}
                                                       </View>
                                                  </View>
                                             ) : (
                                                  <TouchableOpacity
                                                       style={styles.favoriteButton}
                                                       onPress={() => toggleFavorite(item)}
                                                  >
                                                       <AntDesign
                                                            name="heart"
                                                            size={24}
                                                            color="#ff4757"
                                                       />
                                                  </TouchableOpacity>
                                             )}
                                        </View>
                                        {/* ITEM DETAILS */}
                                        <Text style={styles.name}>{item?.jeName}</Text>
                                        <View style={styles.saleContainer}>
                                             <Text style={styles.saleText}>Sale: {(item?.percentOff * 100).toFixed(0)}%</Text>
                                        </View>
                                   </Pressable>
                              )
                         })
                    ) : (
                         <View style={styles.emptyContainer}>
                              {/* EMPTY STATE */}
                              <Text style={styles.emptyText}>No item</Text>
                              <TouchableOpacity
                                   style={styles.browseButton}
                                   onPress={() => navigation.navigate('Home')}
                              >
                                   <Text style={styles.browseButtonText}>Browser</Text>
                              </TouchableOpacity>
                         </View>
                    )}
               </ScrollView>
          </View>
     )
}

const styles = StyleSheet.create({
     // CONTAINER STYLES
     screenContainer: {
          flex: 1,
          backgroundColor: '#f5f5f5'
     },
     container: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          padding: 10,
          backgroundColor: '#f5f5f5'
     },

     // HEADER STYLES
     header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#eee'
     },
     headerTitle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#333'
     },
     headerActions: {
          flexDirection: 'row',
          alignItems: 'center'
     },

     // ACTION BUTTON STYLES
     actionButton: {
          marginLeft: 8,
          paddingVertical: 6,
          paddingHorizontal: 12,
          backgroundColor: '#f0f0f0',
          borderRadius: 4
     },
     actionButtonText: {
          fontSize: 14,
          color: '#333'
     },
     deleteButton: {
          backgroundColor: '#ff4757'
     },
     deleteButtonText: {
          color: '#fff'
     },
     disabledButton: {
          opacity: 0.5
     },
     // FILTER STYLES
     filterContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          padding: 10,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#eee'
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

     // ITEM STYLES
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
     selectedItem: {
          backgroundColor: '#e6f7ff',
          borderWidth: 1,
          borderColor: '#007bff'
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
     // INTERACTION CONTROLS
     favoriteButton: {
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: 20,
          padding: 6,
          zIndex: 10
     },
     checkboxContainer: {
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10
     },
     checkbox: {
          width: 24,
          height: 24,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: '#007bff',
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center'
     },
     checkboxSelected: {
          backgroundColor: '#007bff'
     },
     checkmark: {
          fontSize: 16,
          color: '#fff',
          fontWeight: 'bold'
     },

     // ITEM DETAILS STYLES
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
     // LOADING AND EMPTY STATES
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
     emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          width: '100%'
     },
     emptyText: {
          textAlign: 'center',
          marginTop: 16,
          fontSize: 16,
          color: '#666',
     },
     browseButton: {
          marginTop: 16,
          paddingVertical: 10,
          paddingHorizontal: 20,
          backgroundColor: '#007bff',
          borderRadius: 8
     },
     browseButtonText: {
          color: '#fff',
          fontWeight: '600'
     }
})