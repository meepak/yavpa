
import MyPreview from '@c/my-preview';
import { getFiles } from '@u/storage';
import { CANVAS_HEIGHT, CANVAS_WIDTH, HEADER_HEIGHT, ModalAnimations, SCREEN_WIDTH, SvgDataType } from '@u/types';
import { router } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Modal, TouchableHighlight } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { ContextMenu } from './controls';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import myConsole from './my-console-log';

const FILE_PREVIEW_WIDTH = 100;


const MyList = ({ anchor, width, height }) => {
    const [forceRerenderAt, setForceRerenderAt] = useState(Date.now());
    const [files, setFiles] = useState<SvgDataType[]>([]);
    const scrollY = useSharedValue(0);
    const insets = useSafeAreaInsets();


    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });


    const fetchFiles = useCallback(async () => {
        try {
            let svgData = await getFiles(); // comes from cache so all good
            // Sort the data here before setting it to the state
            // svgData = svgData.sort((a, b) => Date.parse(a.metaData.updatedAt) - Date.parse(b.metaData.updatedAt));
            setFiles(svgData);
        } catch (error) {
            myConsole.log('error fetching files', error)
        }
    }, []);

    useLayoutEffect(() => {
        fetchFiles();
    }, [fetchFiles]);



    const ratio = CANVAS_HEIGHT / CANVAS_WIDTH;
    const ItemWidth = FILE_PREVIEW_WIDTH;
    const ItemHeight = ItemWidth * ratio;

    const ListItem = ({ item, index, scrollY }) => {

        //#region
        // WHAT A FUCKING WASTE OF TIME TRYING TO GET THE SILLY ANIMATION RIGHT THAT NO ONE WILL EVER CARE ABOUT
        // const scale = interpolate(
        //     (scrollY.value % (ItemHeight * files.length)),
        //     [0, ItemHeight * files.length],
        //     [0.5, 1]
        // );

        // const scaleStyles = useAnimatedStyle(() => ({
        //     transform: [
        //         { scale: 1 },
        //     ],
        // }));
        // const translateY = interpolate(
        //     scrollY.value,
        //     inputRange,
        //     [-ItemHeight, -ItemHeight, 0, 0], // adjust scale values as needed
        //     Extrapolation.EXTEND
        // );


        // const rotateX = interpolate(
        //     scrollY.value,
        //     inputRange,
        //     [...Array.from({ length: numItems }).map((_, idx) => idx * (2 * Math.PI / numItems))], // Spread the angles
        //     Extrapolation.EXTEND
        // );


        // const rotateStyles = useAnimatedStyle(() => ({
        //     transform: [
        //         { rotateX: `${rotateX * Math.PI / 180}deg` },
        //         { rotateY: `${rotateX * Math.PI / 180}deg` },
        //         { rotateZ: `${rotateX * Math.PI / 180}deg` },
        //     ],
        // }));


        // const transateYStyles = useAnimatedStyle(() => ({
        //     transform: [
        //         { translateY: translateY },
        //     ],
        //     backfaceVisibility: 'hidden',
        // }));
        // const currentStyles = [scaleStyles, transateYStyles];
        // const currentStyles = [rotateStyles];
        // const currentStyles = [scaleStyles, rotateStyles, transateYStyles];

        //#endregion;

        const currentStyles = [];

        return (
            <Animated.View style={[{
                width: ItemWidth,
                height: ItemHeight,
                borderWidth: 1,
                borderRadius: 7,
                borderColor: 'rgba(0,0,0,0.5)',
                backgroundColor: 'rgba(255,255,255,1)',
                opacity: 1,
                alignContent: 'center',
                alignItems: 'center',
                padding: 2,
                marginBottom: 10,
                overflow: 'hidden',
                // ...elevations[10]
            }, currentStyles]}>


                <TouchableHighlight
                    onPress={() => {
                        setForceRerenderAt(Date.now());
                        router.navigate(`/file?guid=${item.metaData.guid}`);
                    }}
                    activeOpacity={0.1}
                    underlayColor='rgba(0,0,0,0.2)'
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                    }}
                >

                    <MyPreview animate={false} data={item} />

                </TouchableHighlight>

            </Animated.View>
        );
    };


    const renderItem = ({ item, index }: { item: SvgDataType, index: number }) => (
        <ListItem item={item} index={index} scrollY={scrollY} />
    );

    if (!files || (files && files.length === 0)) {
        return null;
    }

    return (
        <ContextMenu
            anchor={anchor}
            width={width}
            height={height}
            showBackground={false}
            xPosition={SCREEN_WIDTH - width}
            yPosition={HEADER_HEIGHT - insets.top + 7}
            positionOverride={true}
            // yOffsetFromAnchor={10}
            closeMenuAt={forceRerenderAt}
            animationIn={ModalAnimations.slideInRight}
            animationOut={ModalAnimations.slideOutRight}
        >
            <Animated.FlatList
                // contentContainerStyle={{ padding: 5 }}
                // style={{ flex: 1, }}
                keyExtractor={item => item.metaData.guid}
                data={files}
                onScroll={scrollHandler}
                renderItem={renderItem}
                horizontal={false}
                showsVerticalScrollIndicator={false}
            />
        </ContextMenu>
    )
}

export default MyList
