import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import MyGradientBackground from '@c/my-gradient-background';
import { FOOTER_HEIGHT } from '@u/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MyPathDataContext } from '@x/svg-data';
import { precise } from '@u/helper';
import MyTicker from '@c/my-ticker';

const Footer = () => {
    const insets = useSafeAreaInsets();
    const { myPathData } = useContext(MyPathDataContext);

    const defaultMessage = "This is a development preview. Tips: Long press to delete the sketch. Double tap to select the path. Scroll the menu items to explore options.";

    const [message, setMessage] = useState(defaultMessage);

    useEffect(() => {
        if(myPathData.pathData.length === 0) {
            return;
        }

        const totals = myPathData.pathData.reduce((acc, path) => {
            acc.totalPaths += 1;
            acc.totalVisiblePaths += path.visible ? 1 : 0;
            acc.totalSelectedPaths += path.selected ? 1 : 0;
            acc.totalPathLength += path.path.length;
            acc.totalPathTime += path.time;
            acc.totalVisiblePathsLength += path.visible ? path.path.length : 0;
            acc.totalSelectedPathsLength += path.selected ? path.path.length : 0;

            return acc;
        }, {
            totalPaths: 0,
            totalVisiblePaths: 0,
            totalSelectedPaths: 0,
            totalPathLength: 0,
            totalPathTime: 0,
            totalVisiblePathsLength: 0,
            totalSelectedPathsLength: 0,
        });

        const {
            totalPaths,
            totalVisiblePaths,
            totalSelectedPaths,
            totalPathLength,
            totalPathTime,
            totalVisiblePathsLength,
            totalSelectedPathsLength
        } = totals;

        if (totalPaths > 0) {
            let msg =  totalPaths + " Path | ";
            msg += "Length: " + totalPathLength + " | ";
            msg += "Time: " + precise(totalPathTime) + " | ";
            msg += "Hidden: " + (totalPaths - totalVisiblePaths) + " | ";
            msg += "Selected: " + (totalSelectedPaths) + " | ";
            msg += "Selected Length: " + totalSelectedPathsLength + " | ";

            // myConsole.log(msg);
            setMessage(defaultMessage + " | " + msg);
        }
    },[myPathData])
        return (
            <View style={{
                position: 'absolute',
                bottom: insets.bottom,
                left: 0,
                right: 0,
                height: FOOTER_HEIGHT,
                justifyContent: 'center',
                borderTopWidth: 1,
                borderTopColor: '#4f236d',
                zIndex: 99,
            }}>
                <MyGradientBackground reverse={true}>
                    <MyTicker message={message} />
                </MyGradientBackground>
            </View>
        );
    };


export default Footer;
