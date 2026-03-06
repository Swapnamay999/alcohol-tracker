import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config'; // Default theme

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider config={config}>
        <Drawer
          screenOptions={{
            headerStyle: { backgroundColor: '#242424' },
            headerTintColor: '#00FF00', // Neon accent
            drawerStyle: { backgroundColor: '#000000' },
            drawerActiveTintColor: '#00FF00',
            drawerInactiveTintColor: '#A0A0A0',
          }}
        >
          <Drawer.Screen 
            name="index" 
            options={{ drawerLabel: 'Drink Logger', title: 'Log Consumption' }} 
          />
          <Drawer.Screen 
            name="profile" 
            options={{ drawerLabel: 'User Physiology', title: 'Body Metrics' }} 
          />
        </Drawer>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}