import React, {
	createContext, useCallback, useEffect, useRef,
} from 'react';
import Toast from 'react-native-root-toast';
import {RootSiblingParent} from 'react-native-root-siblings';
import {MY_BLACK} from '@u/types';

export type ToastOptions = {
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
	textStyle?: Record<string, unknown>;
};

export type ToastFunction = (message: string, options?: ToastOptions) => void;

export type ToastContextType = {
	showToast: ToastFunction;
};

const ToastContext = createContext<ToastContextType>({
	showToast(message: string, options?: Record<string, unknown>) {},
});

function ToastProvider({children}) {
	const toastReference = useRef();

	const showToast: ToastFunction = useCallback((message: string, options: ToastOptions = {}) => {
		// Provide my toast options
		const defaultOptions = {
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
			textStyle: {fontSize: 18},
		};

		options = {...defaultOptions, ...options};

		if (toastReference.current) {
			Toast.hide(toastReference.current);
		}

		toastReference.current = Toast.show(message, options);
	}, []);

	useEffect(() => () => {
		if (toastReference.current) {
			Toast.hide(toastReference.current);
		}
	}, []);

	return (
		<RootSiblingParent>
			<ToastContext.Provider value={{showToast}}>
				{children}
			</ToastContext.Provider>
		</RootSiblingParent>
	);
}

export {ToastContext, ToastProvider};
