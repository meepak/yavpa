
import MyPreview from '@c/my-preview';
import { deleteFile, getFiles } from '@u/storage';
import { CANVAS_HEIGHT, CANVAS_WIDTH, SCREEN_HEIGHT, SCREEN_WIDTH, SvgDataType } from '@u/types';
import { router } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, FlatListProps, TouchableOpacity, View, Text, TouchableHighlight } from 'react-native';
import Animated, { useSharedValue, interpolate, useAnimatedScrollHandler, useAnimatedStyle, withClamp, Extrapolation } from 'react-native-reanimated';

const FILE_PREVIEW_WIDTH = 100;
const FILE_PREViEW_HEIGHT = FILE_PREVIEW_WIDTH * CANVAS_HEIGHT / CANVAS_WIDTH;
// const OFFSET = 125;
const MINIMUM_GAP_BETWEN_PREVIEW = 11;
const FILE_PREVIEW_BOTTOM_MARGIN = 15;

const ITEM_WIDTH = 100;
const ITEM_HEIGHT = 70;
// type MyListProps = FlatListProps<SvgDataType>;


const MyList = ({onSelected}) => {
    const [noSketch, setNoSketch] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [files, setFiles] = useState<SvgDataType[]>([]);
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const fetchFiles = useCallback(async () => {
        try {
            setIsLoading(true);
            let svgData = await getFiles();
            // Sort the data here before setting it to the state
            svgData = svgData.sort((a, b) => Date.parse(b.metaData.updated_at) - Date.parse(a.metaData.updated_at));
            setFiles(svgData);
            if (svgData.length === 0) {
                setNoSketch(true);
            }
            setIsLoading(false);
        } catch (error) {
            console.log('error fetching files', error)
        }
    }, []);

    useLayoutEffect(() => {
        fetchFiles();
    }, [fetchFiles]);


    const deleteSketchAlert = (guid: string) => {
        // console.log('confirm delete ' + guid);
        Alert.alert("Delete Sketch", "Are you sure you want to delete this sketch permanently?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                onPress: async () => {

                    // console.log('delete', guid)
                    const result = await deleteFile(guid)
                    if (result) {
                        await fetchFiles();
                        // scrollViewRef.current?.forceUpdate();
                    }
                },
            },
        ]);
    }


    const ListItem = ({ item, index, scrollY }) => {
        const inputRange = [
            ITEM_HEIGHT * (index - 2),
            ITEM_HEIGHT * (index - 1),
            ITEM_HEIGHT * index,
            ITEM_HEIGHT * (index + 1),
            ITEM_HEIGHT * (index + 2),
        ];

        const animatedStyles = useAnimatedStyle(() => {
            const scale = interpolate(
                scrollY.value,
                inputRange,
                [1, 1.25, 1.5, 1.75, 1.5], // adjust scale values as needed
                Extrapolation.CLAMP
            );

            const translateX = interpolate(
                scrollY.value,
                inputRange,
                [0, 0, 0, 0, 0], // adjust translateX values as needed
                Extrapolation.CLAMP
            );

            return {
                transform: [{ scale }, { translateX }],
            };
        });

        return (
                <Animated.View style={[{
                    width: ITEM_WIDTH,
                    height: ITEM_HEIGHT,
                    borderWidth: 1,
                    borderRadius: 7,
                    borderColor: 'rgba(0,0,0,0.5)',
                    backgroundColor: 'rgb(255,255,255)',
                    opacity: 1,
                    alignContent: 'center',
                    alignItems: 'center',
                    padding: 2,
                    marginBottom: 10,
                    overflow: 'hidden',
                }, animatedStyles]}>


                <TouchableHighlight
                    onPress={() => {
                        router.navigate(`/file?guid=${item.metaData.guid}`);
                        if (onSelected) onSelected();
                    }}
                    onLongPress={() => deleteSketchAlert(item.metaData.guid)}
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


    return <Animated.FlatList
        contentContainerStyle={{ paddingLeft: 40, paddingBottom: 20, paddingTop: 20, }}
          style={{ flex: 1, height: SCREEN_HEIGHT }}
        keyExtractor={item => item.metaData.guid}
        data={files}
        onScroll={scrollHandler}
        renderItem={renderItem}
        horizontal={false}
        showsVerticalScrollIndicator={false}
    />
}

export default MyList
