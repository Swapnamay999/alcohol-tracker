import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import ToastOverlay from '../components/ToastOverlay';
import { initDB } from '../utils/database';

// Initialize the database when the app starts
initDB();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Force Gluestack into dark mode to prevent white flashes */}
      <GluestackUIProvider config={config} colorMode="dark"> 
        <Drawer
          screenOptions={{
            headerStyle: { backgroundColor: '#242424' },
            headerTintColor: '#00FF00',
            drawerStyle: { backgroundColor: '#000000' }, // Forces the drawer to be black
            drawerActiveTintColor: '#00FF00',
            drawerInactiveTintColor: '#A0A0A0',
            drawerActiveBackgroundColor: '#1A331A', // Dark green highlight
          }}
        >
          {/* Maps to app/index.tsx (Dashboard) */}
          <Drawer.Screen 
            name="index" 
            options={{ drawerLabel: 'Live BAC Dashboard', title: 'Current Status' }} 
          />
          {/* Maps to app/logger.tsx (Drink Logger) */}
          <Drawer.Screen 
            name="logger" 
            options={{ drawerLabel: 'Log Drinks', title: 'Add Beverage' }} 
          />
          {/* Maps to app/profile.tsx (Physiology) */}
          <Drawer.Screen 
            name="profile" 
            options={{ drawerLabel: 'User Physiology', title: 'Body Metrics' }} 
          />
        </Drawer>
        <ToastOverlay /> 
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}