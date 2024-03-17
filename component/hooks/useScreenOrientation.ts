import { useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';

const getDeviceOrientation = async () => {
    const { x, y } = await Accelerometer.getAsync();
    return Math.abs(x) > Math.abs(y) ? 'LANDSCAPE' : 'PORTRAIT';
};

const useDeviceOrientation = () => {
    const [orientation, setOrientation] = useState('PORTRAIT');

    useEffect(() => {
        getDeviceOrientation().then(setOrientation);
    }, []);

    return orientation;
};

export default useDeviceOrientation;