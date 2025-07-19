import axios from "axios"

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL

export const getAll = async () => {
     try {
          return axios.get(`${BASE_URL}`)
     } catch (error) {
          console.log(error)
     }
}

