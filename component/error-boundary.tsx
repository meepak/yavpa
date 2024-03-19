import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Divider } from './controls';
// import MyPathLogo from './logo/my-path-logo';
// import { CANVAS_WIDTH } from '@u/types';
import * as Updates from 'expo-updates';
import { MY_BLACK } from '@u/types';


interface ErrorBoundaryProps {
  children: React.ReactNode;
  identifier?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI, NEED WORK WITH CYCLIC DEPENDENCY
      return (
        <View style={{ ...StyleSheet.absoluteFillObject, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
          {/* <MyPathLogo width={CANVAS_WIDTH / 2} height={CANVAS_WIDTH / 2} animate={false} /> */}
          <Text>Oops!!</Text>
          <Text>Something went horribly wrong.</Text>
          {this.props.identifier && <Text>It happened in {this.props.identifier}.</Text>}
          <Divider width={'100%'} height={3} color={'rgba(0,0,0,1)'} />
          <Text>Please try again.</Text>
          <TouchableOpacity onPress={(e) =>{
            Updates.reloadAsync();
            this.setState({hasError: false});
            }}>
            <Text style={{ color: MY_BLACK }} >Restart</Text>
          </TouchableOpacity>
        </View >
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary