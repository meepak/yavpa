import React, { useEffect, useState } from 'react';
import { DimensionValue, View, ViewStyle } from 'react-native';
import logoData from './my-path.json'
import MyPreview from '@c/my-preview';
import { parseMyPathData } from '@u/helper';

interface MyPathLogoProps {
    width: DimensionValue;
    height: DimensionValue;
    animate: boolean;
    style?: ViewStyle;
    isLoaded?: (val: boolean) => void;
}

const MyPathLogo = ({ width, height, animate, style = {}, isLoaded = (val: boolean) => { } }: MyPathLogoProps) => {
    const lg = parseMyPathData(logoData);
    const [logo, setLogo] = useState(lg);
    if (!logo) return null;

    // const onInit = () => { //if i do this all hell go loose, react goes mad and starts warning
    //     setTimeout(() => isLoaded && isLoaded(true), 200);
    // }
    useEffect(() => {
        isLoaded && isLoaded(true)
    }, []);


    return (
        <View style={[{ width: width, height: height }, style]}>
            <MyPreview
                animate={animate}
                viewBox={logoData.metaData.viewBox}
                data={logo}
            />
        </View>
    );
};

export default MyPathLogo;