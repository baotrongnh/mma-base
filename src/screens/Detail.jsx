import { AntDesign } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native'

export default function Detail({ route }) {
  const { item } = route.params
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites')
        if (storedFavorites) {
          const favorites = JSON.parse(storedFavorites)
          setIsFavorite(!!favorites[item._id || item.id])
        }
      } catch (error) {
        console.error(error)
      }
    }

    checkFavoriteStatus()
  }, [item])

  const toggleFavorite = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites')
      let favorites = storedFavorites ? JSON.parse(storedFavorites) : {}
      const itemId = item._id || item.id

      if (favorites[itemId]) {
        delete favorites[itemId]
        setIsFavorite(false)
        Alert.alert('....')
      } else {
        favorites[itemId] = item
        setIsFavorite(true)
        Alert.alert('....')
      }
      await AsyncStorage.setItem('favorites', JSON.stringify(favorites))
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={[styles.title, { color: item.color[0].toLowerCase() }]}>
          {item.jeName}
        </Text>

        <View style={styles.priceRow}>
          <View style={styles.saleTag}>
            <Text style={styles.saleText}>
              Sale {(item.percentOff * 100).toFixed(0)}%
            </Text>
          </View>

          <TouchableOpacity style={styles.favoriteBtn} onPress={toggleFavorite}>
            <AntDesign
              name={isFavorite ? "heart" : "hearto"}
              size={24}
              color={isFavorite ? "#ff4757" : "#333"}
            />
          </TouchableOpacity>
        </View>

        {/* Thông tin chi tiết */}
        <View style={styles.infoContainer}>
          <InfoItem label="label" value={'name'} />

          <View style={styles.row}>
            <Text style={styles.label}>Boolean</Text>
            <View style={styles.value}>
              {item.stoneStyle ? (
                <AntDesign name="star" size={20} color="gold" />
              ) : (
                <Text>No</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const InfoItem = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  saleTag: {
    backgroundColor: '#f1c40f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saleText: {
    fontWeight: 'bold',
    color: '#333',
  },
  favoriteBtn: {
    padding: 8,
  },
  infoContainer: {
    marginTop: 16,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontWeight: '600',
    color: '#555',
  },
  value: {
    color: '#333',
  },
})