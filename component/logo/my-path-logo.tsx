import React, { useImperativeHandle } from 'react';
import { DimensionValue, View, ViewStyle } from 'react-native';
import * as SystemUI from "expo-system-ui";
import logoData from './my-path.json'
import MyPreview from '@c/my-preview';
import { parseMyPathData } from '@u/helper';

interface MyPathLogoProps {
    width: DimensionValue;
    height: DimensionValue;
    animate: boolean;
    style?: ViewStyle;
}

interface MyPathLogoHandle {
    isLoaded: () => boolean;
}

const MyPathLogo: React.ForwardRefRenderFunction<MyPathLogoHandle, MyPathLogoProps> = ({ width, height, animate, style }, ref) => {
    const logo = parseMyPathData(logoData);

    useImperativeHandle(ref, () => ({
        isLoaded: () => !!logo,
    }));

    if (!logo) return null;
    return (
        <View style={[{ width: width, height: height }, style]}>
            <MyPreview data={logo} animate={animate} viewBox={logoData.metaData.viewBox} />
        </View>
    );
};

export default React.forwardRef(MyPathLogo);