import React from 'react';
import { View } from 'react-native';
import data from './creative-void.json'
import MyPreview from '@c/my-preview';
import { MyPathDataType } from '@u/types';
import { getViewBoxTrimmed } from '@u/helper';

interface CreativeVoidProps {
    width: number;
    height: number;
    animate: boolean;
}

const CreativeVoid: React.FC<CreativeVoidProps> = ({ width, height, animate }) => {
    return (
        <View style={{ width: width, height: height }}>
            <MyPreview data={data as MyPathDataType} animate={animate} viewBox={data.metaData.viewBox} />
        </View>
    );
}

export default CreativeVoid;