import React from 'react';
import {
	Text, View, StyleSheet, TouchableOpacity,
} from 'react-native';
// Import MyPathLogo from './logo/my-path-logo';
// import { CANVAS_WIDTH } from '@u/types';
import * as Updates from 'expo-updates';
import {myBlack} from '@u/types';
import {Divider} from '.';
import myConsole from './pure/my-console-log';

type ErrorBoundaryProperties = {
	children: React.ReactNode;
	identifier?: string;
};

type ErrorBoundaryState = {
	hasError: boolean;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProperties, ErrorBoundaryState> {
	constructor(properties: ErrorBoundaryProperties) {
		super(properties);
		this.state = {hasError: false};
	}

	static getDerivedStateFromError(error: any) {
		return {hasError: true};
	}

	componentDidCatch(error: any, errorInfo: any) {
		myConsole.log(error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI, NEED WORK WITH CYCLIC DEPENDENCY
			return (
				<View style={{
					...StyleSheet.absoluteFillObject, alignContent: 'center', alignItems: 'center', justifyContent: 'center',
				}}>
					{/* <MyPathLogo width={CANVAS_WIDTH / 2} height={CANVAS_WIDTH / 2} animate={false} /> */}
					<Text>Oops!!</Text>
					<Text>Something went horribly wrong.</Text>
					{this.props.identifier && <Text>It happened in {this.props.identifier}.</Text>}
					<Divider width={'100%'} height={3} color={'rgba(0,0,0,1)'} />
					<Text>Please try again.</Text>
					<TouchableOpacity onPress={e => {
						Updates.reloadAsync();
						this.setState({hasError: false});
					}}>
						<Text style={{color: myBlack}} >Restart</Text>
					</TouchableOpacity>
				</View >
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
