import { PointType } from '@u/types';
import React, { useState, useContext, useEffect, createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserPreferencesType {
    penOffset: PointType;
    adjustedPenOffset?: PointType;
    // theme: 'light' | 'dark';
    // language: 'en' | 'es' | 'fr';
    // Add more preferences as needed
}

interface UserPreferencesContextType {
    userPreferences: UserPreferencesType;
    setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferencesType>>;
}

const defaultPreferences: UserPreferencesType = {
    penOffset: { x: 40, y: 40 },
    // theme: 'light',
    // language: 'en',
};

export const UserPreferencesContext = createContext<UserPreferencesContextType>({
    userPreferences: defaultPreferences,
    setUserPreferences: (value: React.SetStateAction<UserPreferencesType>) => { },
});

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userPreferences, setUserPreferences] = useState<UserPreferencesType>(defaultPreferences);

    // Store user preferences in AsyncStorage whenever they change
    useEffect(() => {
        const storeData = async () => {
            try {
                const jsonValue = JSON.stringify(userPreferences);
                await AsyncStorage.setItem('@userPreferences', jsonValue);
            } catch (e) {
                // saving error
                console.log(e);
            }
        };

        storeData();
    }, [userPreferences]);

    // Load user preferences from AsyncStorage when the component is first mounted
    useEffect(() => {
        const loadData = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@userPreferences');
                if (jsonValue != null) {
                    setUserPreferences(JSON.parse(jsonValue));
                }
            } catch (e) {
                // loading error
                console.log(e);
            }
        };

        loadData();
    }, []);

    return (
        <UserPreferencesContext.Provider value={{ userPreferences, setUserPreferences }}>
            {children}
        </UserPreferencesContext.Provider>
    );
};

export const useUserPreferences = (): UserPreferencesContextType => {
    const context = useContext(UserPreferencesContext);
    if (!context) {
        throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
    }
    return context;
};