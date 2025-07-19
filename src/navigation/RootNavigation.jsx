import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Detail from '../screens/Detail'
import BottomTab from './BottomTab'

const Stack = createNativeStackNavigator()

export default function RootNavigation() {
     return (
          <NavigationContainer>
               <Stack.Navigator>
                    <Stack.Screen name="Bottom" component={BottomTab} options={{ headerShown: false }} />
                    <Stack.Screen name='Detail' component={Detail} />
               </Stack.Navigator>
          </NavigationContainer>
     )
}