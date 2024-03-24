import React from 'react';
import { DimensionValue, View, ViewStyle } from 'react-native';
import logoData from './my-path.json'
import MyPreview from '@c/my-preview';
import { parseMyPathData } from '@u/helper';

interface MyPathLogoProps {
    width: DimensionValue;
    height: DimensionValue;
    animate: boolean;
    style?: ViewStyle; // Add this line
}

const MyPathLogo: React.FC<MyPathLogoProps> = React.forwardRef(({ width, height, animate, style }, ref) => {
    const logo = parseMyPathData(logoData);
    if (!logo) return null;
    return (
        <View style={[{ width: width, height: height }, style]}>
            <MyPreview data={logo} animate={animate} viewBox={logoData.metaData.viewBox} />
        </View>
    );
});

export default MyPathLogo;