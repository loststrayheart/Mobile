import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons'

import Register from './src/screens/Register'
import Login from "./src/screens/Login";
import Profile from "./src/screens/Profile"
import Dashboard from './src/screens/Dashboard'
import Timetable from './src/screens/Timetable'
import Planner from './src/screens/Planner'
import Add from "./src/screens/Add";
import DashboardAdd from "./src/screens/DashboardAdd";
import DashboardAdd_NextClass from "./src/screens/DashboardAdd_NextClass";

import { PlannerProvider } from "./src/context/PlannerContext";
import Select from "./src/screens/Select";
import ActivityAdd from "./src/screens/ActivityAdd";
import EditPage from "./src/screens/EditPage";

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()
const PlannerStack = createNativeStackNavigator()
const DashboardStack = createNativeStackNavigator()
const AuthStack = createNativeStackNavigator()
const TimetableStack = createNativeStackNavigator()

const DashboardScreen = () => {
    return (
        <DashboardStack.Navigator>
            <DashboardStack.Screen name="Home" component={Dashboard} />
            <DashboardStack.Screen name="Upcoming" component={DashboardAdd} />
            <DashboardStack.Screen name="NextClass" component={DashboardAdd_NextClass} />
            <DashboardStack.Screen name="Select" component={Select}/>
            <PlannerStack.Screen name="Add" component={Add} />
            <PlannerStack.Screen name="Activity_Add" component={ActivityAdd}/>
        </DashboardStack.Navigator>
    )
}


const PlannerScreen = () => {
    return (
        <PlannerStack.Navigator>
            <PlannerStack.Screen name="Planner" component={Planner} />
        </PlannerStack.Navigator>
    )
}

const TimetableScreen = () => {
    return (
        <TimetableStack.Navigator>
            <TimetableStack.Screen name='Timetable' component={Timetable}/>
            <TimetableStack.Screen name='EditPage' component={EditPage}/>
        </TimetableStack.Navigator>
    )
}

const MainTab = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, size, color }) => {

                    let iconName

                    if (route.name == 'Home') {
                        iconName = focused ? 'home' : 'home-outline'
                    }
                    else if (route.name == 'Activity') {
                        iconName = focused ? 'add-circle' : 'add-outline'
                    }
                    else if (route.name == 'Timetable') {
                        iconName = focused ? 'calendar' : 'calendar-outline'
                    }
                    else if (route.name == 'Profile') {
                        iconName = focused ? 'person' : 'person-outline'
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

            })}
        >

            <Tab.Screen
                name="Home"
                component={DashboardScreen}
            />

            <Tab.Screen
                name="Activity"
                component={PlannerScreen}
            />

            <Tab.Screen
                name="Timetable"
                component={TimetableScreen}
            />

            <Tab.Screen
                name="Profile"
                component={Profile}
            />

        </Tab.Navigator>
    )
}

const AuthScreen = () => {
    return (
        <AuthStack.Navigator>
            <AuthStack.Screen name="Register" component={Register} />
            <AuthStack.Screen name="Login" component={Login} />

        </AuthStack.Navigator>
    )
}

const App = () => {
    return (

        <PlannerProvider>

            <NavigationContainer>

                <Stack.Navigator screenOptions={{ headerShown: false }}>

                    <Stack.Screen name="Auth" component={AuthScreen} />
                    <Stack.Screen name="Main" component={MainTab} />

                </Stack.Navigator>

            </NavigationContainer>

        </PlannerProvider>

    )
}

export default App