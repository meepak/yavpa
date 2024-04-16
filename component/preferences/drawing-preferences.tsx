import {Divider, MySlider} from '@c/controls';
import MyCheckBox from '@c/my-check-box';
import myConsole from '@c/my-console-log';
import MyPath from '@c/my-path';
import MyPen from '@c/my-pen';
import {
	createPathdata, getDeviceOrientation, getPathFromPoints, getPenOffsetFactor,
} from '@u/helper';
import {
	MY_BLACK, Orientation, type OrientationType, type PointType, SCREEN_WIDTH,
} from '@u/types';
import {UserPreferencesContext} from '@x/user-preferences';
import React, {
	useContext, useEffect, useRef, useState,
} from 'react';
import {
	View, Text, Animated, Easing, ImageBackground,
} from 'react-native';
import {Image} from 'expo-image';
import {GestureDetector, Gesture, GestureHandlerRootView} from 'react-native-gesture-handler';
import Svg, {Circle} from 'react-native-svg';

const DrawingPreferences: React.FC<{disableParentScroll: (value: boolean) => void}> = ({disableParentScroll}) => {
	const orientation = useRef<OrientationType | undefined>();
	const factor = useRef<PointType | undefined>();

	const {usePenOffset, penOffset, setUserPreferences} = useContext(UserPreferencesContext);
	const [penTip, setPenTip] = useState();
	const [samplePathData, setSamplePathData] = useState({...createPathdata(MY_BLACK, 2, 1)});

	const [drawingPadActivated, setDrawingPadActivated] = useState(false);
	const [myCircle, setMyCircle] = useState({cx: 0, cy: 0});

	const myCircleAnimation = useRef(new Animated.Value(0)).current;
	const colorAnimation = useRef(new Animated.Value(0)).current; // 0: yellow, 1: sky light blue
	const rotateAnimation = useRef(new Animated.Value(0)).current;

	const startPoint = useRef({x: 0, y: 0});
	const points = useRef<PointType[]>([]);

	const AnimatedCircle = Animated.createAnimatedComponent(Circle);

	const rotateImage = angle => {
		Animated.timing(rotateAnimation, {
			toValue: angle,
			duration: 500,
			easing: Easing.linear,
			useNativeDriver: true,
		}).start();
	};

	//  Const myCircleR = myCircleAnim.interpolate({
	//     inputRange: [0, 1],
	//     outputRange: [0, 500],
	//  });

	const rotateData = rotateAnimation.interpolate({
		inputRange: [0, 360],
		outputRange: ['0deg', '360deg'],
	});

	const backgroundColor = colorAnimation.interpolate({
		inputRange: [0, 1],
		outputRange: ['yellow', 'skyblue'],
	});

	const pan = Gesture.Pan();
	pan.activateAfterLongPress(250);
	pan.blocksExternalGesture();

	pan.onBegin(async event => {
		setMyCircle({cx: event.x, cy: event.y});

		Animated.timing(myCircleAnimation, {
			toValue: 1,
			duration: 250,
			useNativeDriver: true,
		}).start(() => {
			setDrawingPadActivated(true);
			disableParentScroll(true);
		});

		// Console.log("This will run every second!");

		orientation.current = await getDeviceOrientation() as any;
		factor.current = await getPenOffsetFactor(orientation.current as any);
		myConsole.log(factor.current);
		penOffset.x = (factor.current?.x || 0) * penOffset.x;
		penOffset.y = (factor.current?.y || 0) * penOffset.y;

		// StartPoint.current.x = event.translationX;
		// startPoint.current.y = event.translationY;

		switch (orientation.current) {
			case Orientation.LANDSCAPE_DOWN: {
				rotateImage(90);
				break;
			}

			case Orientation.LANDSCAPE_UP: {
				rotateImage(270);
				break;
			}

			case Orientation.PORTRAIT_DOWN: {
				rotateImage(0);
				break;
			}

			case Orientation.PORTRAIT_UP: {
				rotateImage(180);
				break;
			}

			default: {
				break;
			}
		}
	});

	pan.onUpdate(event => {
		// Const xOffset = event.translationX - startPoint.current.x;
		// const yOffset = event.translationY - startPoint.current.y;

		const x = penOffset.x + event.x;
		const y = penOffset.y + event.y;

		// Update starting point for the next frame
		// startPoint.current.x = event.translationX;
		// startPoint.current.y = event.translationY;
		points.current.push({x, y});
		setSamplePathData(previous => ({...previous, path: getPathFromPoints(points.current)}));

		setPenTip({x, y} as any);

		// MyConsole.log('update of pan',  xOffset, yOffset);
	});

	pan.onEnd(() => {
		myConsole.log('ending of pan');
		Animated.timing(myCircleAnimation, {
			toValue: 0,
			duration: 100,
			useNativeDriver: true,
		}).start(() => {
			setDrawingPadActivated(false);
		});

		// StartPoint.current.x = 0;
		// startPoint.current.y = 0;
		points.current.length = 0;
		// SetPenTip({x: -99, y: -99});
		disableParentScroll(false);
	});

	return (
		<View style={{marginHorizontal: 15, marginVertical: 20}}>
			<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
				<MyCheckBox
					label='Use Pen Offset'
					checked={usePenOffset}
					onChange={value => {
						setUserPreferences({usePenOffset: value});
					}}
					checkBoxFirst
					textStyle={{fontWeight: 'bold', color: MY_BLACK}}
					iconStyle={{color: '#512dab'}}
				/>

				<Text>x: {penOffset.x}, y: {penOffset.y}</Text>
			</View>

			<Divider width='100%' height={5} color={'red'} />

			<View style={{
				width: SCREEN_WIDTH, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
			}}>
				<MySlider
					name='X Offset'
					value={penOffset.x || 0}
					onValueChange={(value: number) => {
						setUserPreferences({penOffset: {...penOffset, x: value}});
					}}
					minimumValue={-100}
					maximumValue={100}
					step={1}
					horizontal={true}
					plusMinusButtons={false}
					style={{width: '100%'}}
				/>

				<MySlider
					name='Y Offset'
					value={penOffset.y || 0}
					onValueChange={(value: number) => {
						setUserPreferences({penOffset: {...penOffset, y: value}});
					}}
					minimumValue={-100}
					maximumValue={100}
					step={1}
					horizontal={true}
					plusMinusButtons={false}
					style={{width: '100%'}}
				/>

			</View>

			<ImageBackground source={require('@a/small-canvas.png')} style={{width: SCREEN_WIDTH - 30, height: 300}}>

				<GestureHandlerRootView style={{width: SCREEN_WIDTH}}>
					<GestureDetector gesture={pan}>
						<View
							style={{
								left: 7, width: SCREEN_WIDTH - 45, height: 265, backgroundColor: 'transparent',
							}}
						>
							<Svg
								width='100%'
								height={'100%'}
							>
								<MyPath prop={samplePathData} keyProp='test' />
								{ drawingPadActivated && penTip && <MyPen tip={penTip} />}

								{
									!drawingPadActivated && <AnimatedCircle
										cx={myCircle.cx}
										cy={myCircle.cy}
										r={myCircleAnimation.interpolate({
											inputRange: [0, 1],
											outputRange: [0, 400],
										})} fill={'#FFCCFAAA'} stroke={'#FFCCCDCC'} strokeWidth={52} />
								}
							</Svg>
							<View style={{position: 'absolute', right: 0, bottom: 0}}>
								<Text>{orientation.current}</Text>
							</View>
						</View>
					</GestureDetector>
				</GestureHandlerRootView>
			</ImageBackground>
			{/* {drawingPadActivated &&
                <Animated.View style={{ position: 'absolute', left: -10, top: -20, width: 100, height: 150, transform: [{ scale: 0.5 }, { rotate: rotateData }] }}>
                    <Image style={{ width: 100, height: 150 }} source={require('@a/arrow-gif.gif')} contentFit="contain" contentPosition={'center'} />
                </Animated.View>
            } */}
		</View>
	);
};

export default DrawingPreferences;
