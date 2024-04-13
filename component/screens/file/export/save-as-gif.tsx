import MySheetModal from "@c/controls/my-sheet-modal";
import { CANVAS_HEIGHT, CANVAS_VIEWBOX_DEFAULT, CANVAS_WIDTH, HEADER_HEIGHT, I_AM_IOS, MY_BLACK, MyPathDataType, SCREEN_HEIGHT, SCREEN_WIDTH, SvgAnimateHandle } from "@u/types";
import SvgAnimate from "../preview/animate";
import { Button, View } from "react-native";
import ViewShot, { captureRef, CaptureOptions } from "react-native-view-shot";
import { useEffect, useRef, useState } from "react";
import MyPreview from "@c/my-preview";
import { getViewBoxTrimmed, precise } from "@u/helper";
import * as Sharing from "expo-sharing";
import * as FileSystem from 'expo-file-system';
import GifjsWebview from "./GifjsWebview";
import myConsole from "@c/my-console-log";

interface SaveAsGifProps {
    isVisible: boolean;
    onClose?: () => void;
    myPathData: MyPathDataType;
}
const SaveAsGif: React.FC<SaveAsGifProps> = ({ isVisible, onClose, myPathData }) => {
    const modalHeight = SCREEN_HEIGHT - HEADER_HEIGHT - 15;
    const controlsHeight = 150;
    const previewHeight = modalHeight - controlsHeight - (controlsHeight / 2);
    const previewWidth = CANVAS_WIDTH * previewHeight / CANVAS_HEIGHT;

    const previewRef = useRef<SvgAnimateHandle | null>(null);


    const boundaryBox = getViewBoxTrimmed(myPathData.pathData);
    const trimmedWidth = precise(boundaryBox.split(' ')[2]);
    const trimmedHeight = precise(boundaryBox.split(' ')[3]);
    const adjustedWidth = previewWidth * trimmedWidth / CANVAS_WIDTH;
    const adjustedHeight = previewHeight * trimmedHeight / CANVAS_HEIGHT;

    const minimumSize = 100;
    const viewShotRef = useRef<ViewShot>(null);
    const screenRef = useRef<View>(null);

    const [top, setTop] = useState(0);
    const [left, setLeft] = useState(0);
    const [width, setWidth] = useState(adjustedWidth);
    const [height, setHeight] = useState(adjustedHeight);
    const [recording, setRecording] = useState(false);

    const [readyToGifEncoding, setReadyToGifEncoding] = useState(false);
    // const [base64Images, setBase64Images] = useState<string[]>([]);
    const base64ImagesRef = useRef<string[]>([]);


    useEffect(() => {
        if (previewRef.current) {
            previewRef.current.playAnimation();
        }
    }, [left, top, width, height]);

    const moveViewShotWindow = (direction: 'up' | 'down' | 'left' | 'right') => {
        const offset = 5 * ((direction === 'up' || direction === 'left') ? - 1 : 1);
        const setFunction = direction === 'up' || direction === 'down' ? setTop : setLeft;
        const previewDimension = direction === 'up' || direction === 'down' ? previewHeight : previewWidth;
        const viewShotDimension = direction === 'up' || direction === 'down' ? height : width;

        setFunction(
            (prev) =>
                (prev + offset) > (previewDimension - viewShotDimension)
                    ? previewWidth - viewShotDimension
                    : (prev + offset) < 0
                        ? 0
                        : prev + offset
        );
    }

    const resizeViewShotWindow = (scale: '+x' | '-x' | '+y' | '-y') => {
        const isX = scale === '+x' || scale === '-x';
        const scaleFunction = isX ? setWidth : setHeight;
        const previewDimension = isX ? previewWidth : previewHeight;
        const offset = 5 * (scale === '+x' || scale === '+y' ? 1 : -1);

        scaleFunction(
            (prev) =>
                (prev + offset) > previewDimension
                    ? previewDimension
                    : (prev + offset) < minimumSize
                        ? minimumSize
                        : prev + offset
        );
    }

    const download = async (base64Img, ext) => {
        const uri = FileSystem.cacheDirectory + 'output.' + ext;
        // myConsole.log(uri);
        base64Img = base64Img.replace('data:image/'+ext+';base64,', '');
        // myConsole.log(base64Img);
        await FileSystem.writeAsStringAsync(uri, base64Img, { encoding: FileSystem.EncodingType.Base64 });
        const cUri = await FileSystem.getContentUriAsync(uri);
        await Sharing.shareAsync(I_AM_IOS ? cUri : uri);
        if (!(await Sharing.isAvailableAsync())) {
            alert(`Uh oh, sharing isn't available on your platform`);
            return;
        }
        await Sharing.shareAsync(uri);
    };


    const takeScreenshot = async () => {
        const img = await captureRef(screenRef, { snapshotContentContainer: false, format: 'png', quality: 1, result: 'base64' });
        // myConsole.log("Base64 Image: ", img);
        await download(img, 'png');
    };

    let interval;
    let images: string[] = [];
    const onAnimationBegin = () => {
        // myConsole.log('begin..')
        if (recording) {
            interval = setInterval(async () => {
                const img = await captureRef(screenRef, { snapshotContentContainer: false, format: 'png', quality: 1, result: 'base64' });
                images.push(img);
                // setBase64Images(prev => [...prev, img]);
                // myConsole.log('got image in in base64, length: ', img.length, 'total images', images.length)
                // myConsole.log(img);
            }, 1000/25); //make this user adjustable

        }
    };

    const onAnimationEnd = () => {
        // myConsole.log('end..')
        if (recording) {
            clearInterval(interval);
            setRecording(false);
            // setBase64Images(images); // this takes forever to write into state??
            base64ImagesRef.current = images;
            setReadyToGifEncoding(true);
            // myConsole.log('all done sending for gif encoding images ', base64ImagesRef.current.length)

        }
    };

    const onGifEncoded = async (base64GifData) => {
        // myConsole.log('on gif downloaded..');
        // save and download gif file
        setReadyToGifEncoding(false);
        await download(base64GifData, 'gif');
    }

    const onRecord = () => {
        setRecording(true);
        setTimeout(() => {
            // myConsole.log('starting in 1 s');
            previewRef.current?.playAnimation();
        }, 1000);

    }

    return (
        <MySheetModal
            isVisible={isVisible}
            height={modalHeight}
            onClose={() => { onClose && onClose() }}
            title="Export as GIF"
        >

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ position: 'absolute', width: width, height: height, left: left, top: top, borderWidth: 1, borderColor: 'blue' }} ref={screenRef} >

                    <View
                        style={{
                            position: 'absolute',
                            left: -left,
                            top: -top,
                            width: previewWidth,
                            height: previewHeight,
                            borderWidth: 1,
                            borderColor: 'green',
                        }}
                        collapsable={false}
                    >
                        <SvgAnimate
                            myPathData={myPathData}
                            viewBox={CANVAS_VIEWBOX_DEFAULT}
                            ref={previewRef}
                            onLoopBegin={onAnimationBegin}
                            onLoopEnd={onAnimationEnd}
                        />

                    </View>

                </View>
                <ViewShot ref={viewShotRef} options={{ format: "raw", quality: 1, result: 'base64' }} />
            </View>

            <View style={{
                marginTop: 5,
                width: SCREEN_WIDTH - 40,
                height: controlsHeight,
                backgroundColor: MY_BLACK,
                pointerEvents: recording ? 'none' : undefined
            }}>
                <Button title="Take Screenshot" onPress={takeScreenshot} />

                <View style={{ flexDirection: "row" }}>
                    <View style={{ width: '50%', flexDirection: "row" }}>
                        <View style={{ width: '50%', flexDirection: "column" }}>
                            <Button title="L" onPress={() => { moveViewShotWindow('left') }} />
                            <Button title="U" onPress={() => { moveViewShotWindow('up') }} />
                        </View>

                        <View style={{ width: '50%', flexDirection: "column" }}>
                            <Button title="R" onPress={() => { moveViewShotWindow('right') }} />
                            <Button title="D" onPress={() => { moveViewShotWindow('down') }} />
                        </View>
                    </View>
                    <View style={{ width: '50%', flexDirection: "row" }}>
                        <View style={{ width: '50%', flexDirection: "column" }}>
                            <Button title="W+" onPress={() => { resizeViewShotWindow('+x') }} />
                            <Button title="W-" onPress={() => { resizeViewShotWindow('-x') }} />
                        </View>

                        <View style={{ width: '50%', flexDirection: "column" }}>
                            <Button title="H+" onPress={() => { resizeViewShotWindow('+y') }} />
                            <Button title="H-" onPress={() => { resizeViewShotWindow('-y') }} />
                        </View>
                    </View>

                </View>

                <Button title="Record" onPress={onRecord} />
            </View>
            {
                readyToGifEncoding && <GifjsWebview base64EncodedImages={base64ImagesRef.current} onEncoded={onGifEncoded} />

            }
        </MySheetModal>
    );
}

export default SaveAsGif;