import { setBackgroundColorAsync } from "expo-system-ui";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastProvider } from "@x/toast-context";
import { MyPathDataProvider } from "@x/svg-data";
import { UserPreferencesProvider } from "@x/user-preferences";
import { MY_PRIMARY_COLOR } from "@u/types";
import { PortalProvider } from "@gorhom/portal";

setBackgroundColorAsync(MY_PRIMARY_COLOR);

export default function RootLayout() {
  return (
    <PortalProvider>
      <ToastProvider>
        <UserPreferencesProvider>
          <MyPathDataProvider>
            <GestureHandlerRootView style={{ flex: 1}}>
              <Stack />
            </GestureHandlerRootView>
          </MyPathDataProvider>
        </UserPreferencesProvider>
      </ToastProvider>
    </PortalProvider>
  );
}
