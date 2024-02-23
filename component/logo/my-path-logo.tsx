import React from 'react';
import { View } from 'react-native';
import logoData from './my-path.json'
import MyPreview from '@c/my-preview';
import { SvgDataType } from '@u/types';

interface MyPathLogoProps {
    width: number;
    height: number;
    animate: boolean;
}

const MyPathLogo: React.FC<MyPathLogoProps> = ({ width, height, animate }) => {
    return (
        <View style={{ width: width, height: height }}>
            <MyPreview data={logoData as SvgDataType} animate={animate} />
        </View>
    );
}

export default MyPathLogo;