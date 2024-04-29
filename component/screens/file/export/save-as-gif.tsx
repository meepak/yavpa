import MySheetModal from '@c/controls/my-sheet-modal';
import {
	CANVAS_HEIGHT, CANVAS_VIEWBOX_DEFAULT, CANVAS_WIDTH, HEADER_HEIGHT, I_AM_IOS, MY_BLACK, type MyPathDataType, SCREEN_HEIGHT, SCREEN_WIDTH, type SvgAnimateHandle,
} from '@u/types';
import {Button, View} from 'react-native';
import ViewShot, {captureRef, CaptureOptions} from 'react-native-view-shot';
import {useEffect, useRef, useState} from 'react';
import MyPreview from '@c/controls/my-preview';
import {getViewBoxTrimmed, precise} from '@u/helper';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import SvgAnimate from '../preview/animate';
import GifjsWebview from './GifjsWebview';

type SaveAsGifProperties = {
	isVisible: boolean;
	onClose?: () => void;
	myPathData: MyPathDataType;
};
const SaveAsGif: React.FC<SaveAsGifProperties> = ({isVisible, onClose, myPathData}) => {
	const modalHeight = SCREEN_HEIGHT - HEADER_HEIGHT - 15;
	const controlsHeight = 150;
	const previewHeight = modalHeight - controlsHeight - (controlsHeight / 2);
	const previewWidth = CANVAS_WIDTH * previewHeight / CANVAS_HEIGHT;

	const previewReference = useRef<SvgAnimateHandle | undefined>(null);

	const boundaryBox = getViewBoxTrimmed(myPathData.pathData);
	const trimmedWidth = precise(boundaryBox.split(' ')[2]);
	const trimmedHeight = precise(boundaryBox.split(' ')[3]);
	const adjustedWidth = previewWidth * trimmedWidth / CANVAS_WIDTH;
	const adjustedHeight = previewHeight * trimmedHeight / CANVAS_HEIGHT;

	const minimumSize = 100;
	const viewShotReference = useRef<ViewShot>(null);
	const screenReference = useRef<View>(null);

	const [top, setTop] = useState(0);
	const [left, setLeft] = useState(0);
	const [width, setWidth] = useState(adjustedWidth);
	const [height, setHeight] = useState(adjustedHeight);
	const [recording, setRecording] = useState(false);

	const [readyToGifEncoding, setReadyToGifEncoding] = useState(false);
	// Const [base64Images, setBase64Images] = useState<string[]>([]);
	const base64ImagesReference = useRef<string[]>([]);

	useEffect(() => {
		if (previewReference.current) {
			previewReference.current.playAnimation();
		}
	}, [left, top, width, height]);

	const moveViewShotWindow = (direction: 'up' | 'down' | 'left' | 'right') => {
		const offset = 5 * ((direction === 'up' || direction === 'left') ? -1 : 1);
		const setFunction = direction === 'up' || direction === 'down' ? setTop : setLeft;
		const previewDimension = direction === 'up' || direction === 'down' ? previewHeight : previewWidth;
		const viewShotDimension = direction === 'up' || direction === 'down' ? height : width;

		setFunction(
			previous =>
				(previous + offset) > (previewDimension - viewShotDimension)
					? previewWidth - viewShotDimension
					: ((previous + offset) < 0
						? 0
						: previous + offset),
		);
	};

	const resizeViewShotWindow = (scale: '+x' | '-x' | '+y' | '-y') => {
		const isX = scale === '+x' || scale === '-x';
		const scaleFunction = isX ? setWidth : setHeight;
		const previewDimension = isX ? previewWidth : previewHeight;
		const offset = 5 * (scale === '+x' || scale === '+y' ? 1 : -1);

		scaleFunction(
			previous =>
				(previous + offset) > previewDimension
					? previewDimension
					: ((previous + offset) < minimumSize
						? minimumSize
						: previous + offset),
		);
	};

	const download = async (base64Img, extension) => {
		const uri = FileSystem.cacheDirectory + 'output.' + extension;
		// MyConsole.log(uri);
		base64Img = base64Img.replace('data:image/' + extension + ';base64,', '');
		// MyConsole.log(base64Img);
		await FileSystem.writeAsStringAsync(uri, base64Img, {encoding: FileSystem.EncodingType.Base64});
		const cUri = await FileSystem.getContentUriAsync(uri);
		await Sharing.shareAsync(I_AM_IOS ? cUri : uri);
		if (!(await Sharing.isAvailableAsync())) {
			alert('Uh oh, sharing isn\'t available on your platform');
			return;
		}

		await Sharing.shareAsync(uri);
	};

	const takeScreenshot = async () => {
		const img = await captureRef(screenReference, {
			snapshotContentContainer: false, format: 'png', quality: 1, result: 'base64',
		});
		// MyConsole.log("Base64 Image: ", img);
		await download(img, 'png');
	};

	let interval;
	const images: string[] = [];
	const onAnimationBegin = () => {
		// MyConsole.log('begin..')
		if (recording) {
			interval = setInterval(async () => {
				const img = await captureRef(screenReference, {
					snapshotContentContainer: false, format: 'png', quality: 1, result: 'base64',
				});
				images.push(img);
				// SetBase64Images(prev => [...prev, img]);
				// myConsole.log('got image in in base64, length: ', img.length, 'total images', images.length)
				// myConsole.log(img);
			}, 1000 / 25); // Make this user adjustable
		}
	};

	const onAnimationEnd = () => {
		// MyConsole.log('end..')
		if (recording) {
			clearInterval(interval);
			setRecording(false);
			// SetBase64Images(images); // this takes forever to write into state??
			base64ImagesReference.current = images;
			setReadyToGifEncoding(true);
			// MyConsole.log('all done sending for gif encoding images ', base64ImagesRef.current.length)
		}
	};

	const onGifEncoded = async base64GifData => {
		// MyConsole.log('on gif downloaded..');
		// save and download gif file
		setReadyToGifEncoding(false);
		await download(base64GifData, 'gif');
	};

	const onRecord = () => {
		setRecording(true);
		setTimeout(() => {
			// MyConsole.log('starting in 1 s');
			previewReference.current?.playAnimation();
		}, 1000);
	};

	return (
		<MySheetModal
			isVisible={isVisible}
			height={modalHeight}
			onClose={() => {
				onClose && onClose();
			}}
			title='Export as GIF'
		>

			<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
				<View style={{
					position: 'absolute', width, height, left, top, borderWidth: 1, borderColor: 'blue',
				}} ref={screenReference} >

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
							// viewBox={CANVAS_VIEWBOX_DEFAULT}
							ref={previewReference}
							onLoopBegin={onAnimationBegin}
							onLoopEnd={onAnimationEnd}
						/>

					</View>

				</View>
				<ViewShot ref={viewShotReference} options={{format: 'raw', quality: 1, result: 'base64'}} />
			</View>

			<View style={{
				marginTop: 5,
				width: SCREEN_WIDTH - 40,
				height: controlsHeight,
				backgroundColor: MY_BLACK,
				pointerEvents: recording ? 'none' : undefined,
			}}>
				<Button title='Take Screenshot' onPress={takeScreenshot} />

				<View style={{flexDirection: 'row'}}>
					<View style={{width: '50%', flexDirection: 'row'}}>
						<View style={{width: '50%', flexDirection: 'column'}}>
							<Button title='L' onPress={() => {
								moveViewShotWindow('left');
							}} />
							<Button title='U' onPress={() => {
								moveViewShotWindow('up');
							}} />
						</View>

						<View style={{width: '50%', flexDirection: 'column'}}>
							<Button title='R' onPress={() => {
								moveViewShotWindow('right');
							}} />
							<Button title='D' onPress={() => {
								moveViewShotWindow('down');
							}} />
						</View>
					</View>
					<View style={{width: '50%', flexDirection: 'row'}}>
						<View style={{width: '50%', flexDirection: 'column'}}>
							<Button title='W+' onPress={() => {
								resizeViewShotWindow('+x');
							}} />
							<Button title='W-' onPress={() => {
								resizeViewShotWindow('-x');
							}} />
						</View>

						<View style={{width: '50%', flexDirection: 'column'}}>
							<Button title='H+' onPress={() => {
								resizeViewShotWindow('+y');
							}} />
							<Button title='H-' onPress={() => {
								resizeViewShotWindow('-y');
							}} />
						</View>
					</View>

				</View>

				<Button title='Record' onPress={onRecord} />
			</View>
			{
				readyToGifEncoding && <GifjsWebview base64EncodedImages={base64ImagesReference.current} onEncoded={onGifEncoded} />

			}
		</MySheetModal>
	);
};

export default SaveAsGif;
