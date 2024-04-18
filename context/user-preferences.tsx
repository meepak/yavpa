import {type PointType} from '@u/types';
import React, {
	useState,
	useContext,
	useEffect,
	createContext,
	useMemo,
	useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import myConsole from '@c/controls/pure/my-console-log';

export type UserPreferencesType = {
	usePenOffset: boolean;
	penOffset: PointType;
	defaultStorageDirectory: string;
	// Theme: 'light' | 'dark';
	// language: 'en' | 'es' | 'fr';
	// Add more preferences as needed
};

const defaultPreferences: UserPreferencesType = {
	usePenOffset: false,
	penOffset: {x: 0, y: 0},
	defaultStorageDirectory: 'mypath.mahat.au',
	// Theme: 'light',
	// language: 'en',
};

type UserPreferencesContextType = {
	setUserPreferences: (value: Partial<UserPreferencesType>) => void;
} & UserPreferencesType;

const defaultUserPreferencesContext: UserPreferencesContextType = {
	...defaultPreferences,
	setUserPreferences() {},
};

export const UserPreferencesContext = createContext<UserPreferencesContextType>(
	defaultUserPreferencesContext,
);

export function useUserPreferences() {
	const context = useContext(UserPreferencesContext);

	if (!context) {
		throw new Error(
			'useUserPreferences must be used within a UserPreferencesProvider',
		);
	}

	return context;
}

export const UserPreferencesProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [usePenOffset, setUsePenOffset] = useState(
		defaultPreferences.usePenOffset,
	);
	const [penOffset, setPenOffset] = useState(defaultPreferences.penOffset);
	const [defaultStorageDirectory, setDefaultStorageDirectory] = useState(
		defaultPreferences.defaultStorageDirectory,
	);

	const userPreferences = useMemo(
		() => ({
			usePenOffset,
			penOffset,
			defaultStorageDirectory,
		}),
		[usePenOffset, penOffset, defaultStorageDirectory],
	);

	const setUserPreferences = useCallback(
		(newPreferences: Partial<UserPreferencesType>) => {
			setUsePenOffset(previous => newPreferences.usePenOffset ?? previous);
			setPenOffset(previous => newPreferences.penOffset ?? previous);
			setDefaultStorageDirectory(
				previous => newPreferences.defaultStorageDirectory ?? previous,
			);
		},
		[],
	);

	// Store user preferences in AsyncStorage whenever they change
	useEffect(() => {
		const storeData = async () => {
			try {
				const jsonValue = JSON.stringify(userPreferences);
				await AsyncStorage.setItem('mypath@userPreferences', jsonValue);
			} catch (error) {
				// Saving error
				myConsole.log(error);
			}
		};

		storeData();
	}, [userPreferences]);

	return (
		<UserPreferencesContext.Provider
			value={{...userPreferences, setUserPreferences}}
		>
			{children}
		</UserPreferencesContext.Provider>
	);
};
