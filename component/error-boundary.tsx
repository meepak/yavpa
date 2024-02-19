import React from 'react';
import { Text } from 'react-native';

interface ErrorBoundaryProps {
    children: React.ReactNode;
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
        // You can render any custom fallback UI
        return <Text>Something went wrong.</Text>;
      }
  
      return this.props.children; 
    }
  }

  export default ErrorBoundary