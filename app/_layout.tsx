import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Background, BackgroundOptions } from '@c/background';
import { ToastProvider } from '@x/toast-context';
import { SvgDataProvider } from '@x/svg-data';

export default function RootLayout() {
  return (
    <SvgDataProvider>
      <ToastProvider>
        <Background option={BackgroundOptions.default}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Slot />
          </GestureHandlerRootView>
        </Background>
      </ToastProvider>
    </SvgDataProvider>
  );
}