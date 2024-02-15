import { Slot } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SvgDataProvider } from '@x/svg-data';
import Background from '@c/background';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <SvgDataProvider>
      <Background />
        <GestureHandlerRootView style={{ flex: 1 }}>
          {/* <SafeAreaView style={{ flex: 1 }}> */}
          <Slot />
          {/* </SafeAreaView> */}
        </GestureHandlerRootView>
    </SvgDataProvider>
  );
}
