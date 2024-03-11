import React, { createContext, useCallback, useEffect, useRef } from 'react';
import Toast from 'react-native-root-toast';
import { RootSiblingParent } from 'react-native-root-siblings';

type ToastFunction = (message: string, options?: object) => void;

const ToastContext = createContext<ToastFunction>(() => { });

function ToastProvider({ children }) {
    const toastRef = useRef();

    const showToast = useCallback((message, options = {}) => {
        // provide my toast options
        let defaultOptions = {
            duration: Toast.durations.LONG,
            position: Toast.positions.CENTER,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
            textColor: '#fff',
            backgroundColor: '#0000ff',
            shadowColor: '#a805ee',
            opacity: 1,
            textStyle: { fontSize: 20 },
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
            <ToastContext.Provider value={showToast}>
                {children}
            </ToastContext.Provider>
        </RootSiblingParent>
    );
}

export { ToastContext as ToastContext, ToastProvider };