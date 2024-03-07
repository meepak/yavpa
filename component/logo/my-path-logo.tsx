import React from 'react';
import { View } from 'react-native';
import logoData from './my-path.json'
import MyPreview from '@c/my-preview';
import { SvgDataType } from '@u/types';

interface MyPathLogoProps {
    width: number;
    height: number;
    animate: boolean;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
}

const MyPathLogo: React.FC<MyPathLogoProps> = ({ width, height, animate, left, right, top, bottom }) => {
    const style = {
        width: width,
        height: height,
        left: left ? left : undefined,
        right: right ? right : undefined,
        top: top ? top : undefined,
        bottom: bottom ? bottom : undefined
    };
    return (
        <View style={{ width: width, height: height }}>
            <MyPreview data={logoData as SvgDataType} animate={animate} viewBox={logoData.metaData.viewBox} />
        </View>
    );
}

export default MyPathLogo;