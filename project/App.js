import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Register from './src/screens/Register'
import Profile from "./src/screens/Profile"
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons'
import Dashboard from './src/screens/Dashboard'
import Timetable from './src/screens/Timetable'
import Planner from './src/screens/Planner'
import Add from "./src/screens/Add";
import DashboardAdd from "./src/screens/DashboardAdd";
import { PlannerProvider } from "./src/context/PlannerContext";
import Login from "./src/screens/Login";
import DashboardAdd_NextClass from "./src/screens/DashboardAdd_NextClass";



const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()
const PlannerStack = createNativeStackNavigator()
const DashboardStack = createNativeStackNavigator()


const DashboardScreen = () =>{
  return(
    <DashboardStack.Navigator >
      
      <DashboardStack.Screen name="Home" component={Dashboard}/>
      <DashboardStack.Screen name="Upcoming" component={DashboardAdd}/>
      <DashboardStack.Screen name="NextClass" component={DashboardAdd_NextClass}/>
    </DashboardStack.Navigator>
  )
}

const Explore = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name='Register' component={Register} />
            <Stack.Screen name='Login' component={Login}/>
        </Stack.Navigator>
    )
}

const PlannerScreen = () => {
    return (
        <PlannerStack.Navigator >
            <PlannerStack.Screen name="Planner" component={Planner} />
            <PlannerStack.Screen name="Add" component={Add} />
        </PlannerStack.Navigator>
    )
}

const App = () => {
    return (

        <PlannerProvider>
            <NavigationContainer>
                <Tab.Navigator screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, size, color }) => {
                        let iconName;
                        if (route.name == 'Register') {
                            iconName = focused ? 'person-add' : 'person-add-outline'
                        }
                        else if (route.name == 'Profile') {
                            iconName = focused ? 'man' : 'man-outline'
                        }
                        else if (route.name == 'Home') {
                            iconName = focused ? 'home' : 'home-outline'
                        }
                        else if (route.name == 'Calendar') {
                            iconName = focused ? 'calendar' : 'calendar-outline'
                        }
                        else if (route.name == 'Activity') {
                            iconName = focused ? 'add-circle' : 'add-outline'
                        }
                        return <Ionicons name={iconName} size={size} color={color} />
                    },
                    headerShown: false,
                    tabBarStyle: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        position: 'absolute',
                        elevation: 10
                    }
                })}>
                    <Tab.Screen
                        name="Register"
                        component={Explore} options={{ title: 'Register' }}
                    />
                    <Tab.Screen
                        name="Home"
                        component={DashboardScreen} options={{ title: 'Home' }}
                    />
                    <Tab.Screen
                        name="Activity"
                        component={PlannerScreen} options={{ title: 'Activity' }}
                    />
                    <Tab.Screen
                        name="Calendar"
                        component={Timetable} options={{ title: 'Calendar' }}
                    />
                    
                    <Tab.Screen
                        name="Profile"
                        component={Profile} options={{ title: 'Profile' }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </PlannerProvider>


    )
}

export default App