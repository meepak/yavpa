import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AnimatedColor  from '@c/background/animated-color';
import { ToastProvider } from '@x/toast-context';
import { MyPathDataProvider } from '@x/svg-data';

export default function RootLayout() {
  return (
    <MyPathDataProvider>
      <ToastProvider>
        <AnimatedColor>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Slot />
          </GestureHandlerRootView>
        </AnimatedColor>
      </ToastProvider>
    </MyPathDataProvider>
  );
}