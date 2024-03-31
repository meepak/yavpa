import { setBackgroundColorAsync } from 'expo-system-ui';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AnimatedColor from '@c/background/animated-color';
import { ToastProvider } from '@x/toast-context';
import { MyPathDataProvider } from '@x/svg-data';
import { UserPreferencesProvider } from '@x/user-preferences';

setBackgroundColorAsync("#e0f2fdCC");

export default function RootLayout() {
  return (
    <UserPreferencesProvider>
      <MyPathDataProvider>
        <ToastProvider>
          <AnimatedColor>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Slot />
            </GestureHandlerRootView>
          </AnimatedColor>
        </ToastProvider>
      </MyPathDataProvider>
    </UserPreferencesProvider>
  );
}