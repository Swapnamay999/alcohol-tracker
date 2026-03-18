import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import ToastOverlay from '../components/ToastOverlay';
import { initDB, cleanupOldDrinks } from '../utils/database';

// Initialize the database and cleanup old records when the app starts
initDB();
cleanupOldDrinks();

function CustomDrawerContent(props: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>BAC TRACKER</Text>
          <Text style={styles.drawerSubtitle}>Clinical Physiological Engine</Text>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      
      <View style={styles.drawerFooter}>
        <View style={styles.footerDivider} />
        <Text style={styles.copyrightText}>© 2026 Swapnamay Halder</Text>
        <Text style={styles.licenseText}>Licensed under GPLv3</Text>
        <Text style={styles.freedomText}>Free as in Freedom</Text>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider config={config} colorMode="dark"> 
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerStyle: { backgroundColor: '#242424' },
            headerTintColor: '#00FF00',
            drawerStyle: { backgroundColor: '#000000', width: 280 },
            drawerActiveTintColor: '#00FF00',
            drawerInactiveTintColor: '#A0A0A0',
            drawerActiveBackgroundColor: '#1A331A',
          }}
        >
          <Drawer.Screen 
            name="index" 
            options={{ drawerLabel: 'Live BAC Dashboard', title: 'Current Status' }} 
          />
          <Drawer.Screen 
            name="logger" 
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

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    marginBottom: 10,
  },
  drawerTitle: {
    color: '#00FF00',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  drawerSubtitle: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  drawerFooter: {
    padding: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerDivider: {
    height: 1,
    width: '100%',
    backgroundColor: '#222',
    marginBottom: 15,
  },
  copyrightText: {
    color: '#AAA',
    fontSize: 13,
    fontWeight: '600',
  },
  licenseText: {
    color: '#00FF00',
    fontSize: 11,
    marginTop: 4,
    opacity: 0.8,
  },
  freedomText: {
    color: '#444',
    fontSize: 10,
    marginTop: 2,
    fontStyle: 'italic',
  }
});