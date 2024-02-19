import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SvgDataProvider } from '@x/svg-data';
import Background from '@c/background';

export default function RootLayout() {
  return (
    <SvgDataProvider>
      <Background />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Slot />
        </GestureHandlerRootView>
    </SvgDataProvider>
  );
}
