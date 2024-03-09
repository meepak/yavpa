import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

const useScreenOrientation = () => {
    const [orientation, setOrientation] = useState('PORTRAIT');

    useEffect(() => {
        const checkOrientation = () => {
            const { width, height } = Dimensions.get('window');
            setOrientation(width > height ? 'LANDSCAPE' : 'PORTRAIT');
        };

        const intervalId = setInterval(checkOrientation, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return orientation;
};

export default useScreenOrientation;