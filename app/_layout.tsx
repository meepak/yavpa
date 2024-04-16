import {setBackgroundColorAsync} from 'expo-system-ui';
import {Slot} from 'expo-router';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ToastProvider} from '@x/toast-context';
import {MyPathDataProvider} from '@x/svg-data';
import {UserPreferencesProvider} from '@x/user-preferences';
import {MY_PRIMARY_COLOR} from '@u/types';

setBackgroundColorAsync(MY_PRIMARY_COLOR);

export default function RootLayout() {
	return (
		<UserPreferencesProvider>
			<MyPathDataProvider>
				<ToastProvider>
					<GestureHandlerRootView style={{flex: 1}}>
						<Slot />
					</GestureHandlerRootView>
				</ToastProvider>
			</MyPathDataProvider>
		</UserPreferencesProvider>
	);
}
