import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config'; // Default theme
import ToastOverlay from '../components/ToastOverlay';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider config={config}>
        <Drawer>
          <Drawer.Screen
            name="dashboard"
            options={{ drawerLabel: 'Live BAC Dashboard', title: 'Current Status' }}
          />
          <Drawer.Screen
            name="index"
            options={{ drawerLabel: 'Log Drinks', title: 'Add Beverage' }}
          />
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