import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Home from '../screens/Home'
import Favourite from '../screens/Favourite'
import Premiere from '../screens/Premiere'

const Tab = createBottomTabNavigator()

export default function BottomTab() {
     return (
          <Tab.Navigator>
               <Tab.Screen name="Home" component={Home} />
               <Tab.Screen name="Favourite" component={Favourite} />
               <Tab.Screen name="Premiere" component={Premiere} />
          </Tab.Navigator>
     )
}