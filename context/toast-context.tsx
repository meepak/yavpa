import React, { createContext, useCallback, useEffect, useRef } from 'react';
import Toast from 'react-native-root-toast';
import { RootSiblingParent } from 'react-native-root-siblings';
import { MY_BLACK } from '@u/types';

export interface ToastOptions {
    duration?: number;
    position?: number;
    shadow?: boolean;
    animation?: boolean;
    hideOnPress?: boolean;
    delay?: number;
    textColor?: string;
    backgroundColor?: string;
    shadowColor?: string;
    opacity?: number;
    textStyle?: object;
}

export type ToastFunction = (message: string, options?: ToastOptions) => void;

export interface ToastContextType {
    showToast: ToastFunction;
}

const ToastContext = createContext<ToastContextType>({
  showToast: (message: string, options?: object) => {}
});

function ToastProvider({ children }) {
    const toastRef = useRef();

    const showToast:ToastFunction = useCallback((message: string, options: ToastOptions = {}) => {
        // provide my toast options
        let defaultOptions = {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM,
            shadow: false,
            animation: true,
            hideOnPress: true,
            delay: 0,
            textColor: '#fff',
            backgroundColor: '#041969',
            shadowColor: '#0782d0',
            opacity: 1,
            textStyle: { fontSize: 18 },
        };

        options = { ...defaultOptions, ...options };

        if (toastRef.current) {
            Toast.hide(toastRef.current);
        }

        toastRef.current = Toast.show(message, options);
    }, []);

    useEffect(() => {
        return () => {
            if (toastRef.current) {
                Toast.hide(toastRef.current);
            }
        };
    }, []);

    return (
        <RootSiblingParent>
            <ToastContext.Provider value={{showToast}}>
                {children}
            </ToastContext.Provider>
        </RootSiblingParent>
    );
}

export { ToastContext, ToastProvider };