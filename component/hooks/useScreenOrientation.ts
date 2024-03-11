import { useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';

/**
 * Be aware that this will impact the current running animation
 * Have to fix that before using this.
 * Hence, we are not doing Landascape support for now.
 * @returns PORTRAIT or LANDSCAPE
 */
const useDeviceOrientation = () => {
    const [orientation, setOrientation] = useState('PORTRAIT');

    useEffect(() => {
        Accelerometer.setUpdateInterval(1000); // set accelerometer updates to 1 per second

        const subscription = Accelerometer.addListener(({ x, y }) => {
            setOrientation(Math.abs(x) > Math.abs(y) ? 'LANDSCAPE' : 'PORTRAIT');
        });

        return () => {
            subscription && subscription.remove();
        };
    }, []);

    return orientation;
};

export default useDeviceOrientation;