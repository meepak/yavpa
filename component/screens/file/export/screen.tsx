import React, {useContext, useEffect, useState} from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import LottieView, {type AnimationObject} from 'lottie-react-native';
import MyPreview from '@c/controls/my-preview';
import {
	CANVAS_HEIGHT,
	CANVAS_VIEWBOX_DEFAULT,
	CANVAS_WIDTH,
	I_AM_IOS,
} from '@u/types';
import * as format from '@u/formatters';
import createLottie from '@lottie/create';
import ErrorBoundary from '@c/controls/error-boundary';
import myConsole from '@c/controls/pure/my-console-log';
import {MyPathDataContext} from '@x/svg-data';
import SaveAsGif from './save-as-gif';

const ExportScreen = ({initControls}) => {
	const {myPathData} = useContext(MyPathDataContext);
	const [saveAsGif, setSaveAsGif] = useState(false);

	const [nativeJson, setNativeJson] = useState('');
	const [lottieJson, setLottieJson] = useState({} as AnimationObject);
	const [staticSvg, setStaticSvg] = useState('');
	const [smilSvg, setSmilSvg] = useState('');
	const [cssSvg, setCssSvg] = useState('');

	// This hook should only execute once this page component loads,
	// no need to update when svg Data is updating
	useEffect(() => {
		if (myPathData === undefined) {
			return;
		}

		try {
			const lottieData = createLottie(myPathData);
			setLottieJson(JSON.parse(lottieData));

			setNativeJson(JSON.stringify(myPathData));
			setStaticSvg(format.getStaticSvg(myPathData));
			setSmilSvg(format.getSmilSvg(myPathData));
			setCssSvg(format.getCssSvg(myPathData));
		} catch (error) {
			myConsole.log('error occcured, log properly - ' + error);
		} finally {
			myConsole.log('al goo di guess');
		}
	}, []);

	const copyToClipboard = (data = '') => {
		Clipboard.setStringAsync(data);
	};

	// Should open the prompt for user to select the location to save the  file with
	// default filename (user can change it if they like, but extension remains fixed)
	// and data in it in both ios and android
	// ask for permission if needed
	const download = async (filename = '', data = '') => {
		// MyConsole.log(data)
		if (!filename || !data) {
			return;
		}

		const uri = FileSystem.cacheDirectory + filename;
		await FileSystem.writeAsStringAsync(uri, data, {
			encoding: FileSystem.EncodingType.UTF8,
		});
		const cUri = await FileSystem.getContentUriAsync(uri);
		if (!(await Sharing.isAvailableAsync())) {
			alert('Uh oh, sharing isn\'t available on your platform');
			return;
		}

		await Sharing.shareAsync(I_AM_IOS ? cUri : uri);
	};

	const exportOptions = [
		{
			name: 'My Path internal format JSON',
			description:
        'Very simple json representation of the path data so that it can be loaded/unloaded etc?',
			downloadAction: async () =>
				download(myPathData.metaData.name + '.json', nativeJson),
			copyAction() {
				copyToClipboard(nativeJson);
			},
		},
		{
			name: 'GIF',
			description: 'Hopefully this will work fine.',
			downloadAction() {
				setSaveAsGif(true);
			},
			copyAction: null,
			downloadActionText: 'Export as GIF',
		},
		{
			name: 'Static SVG',
			description:
        'Ideal for simple, scalable graphics. Lightweight and versatile.',
			downloadAction: async () =>
				download(myPathData.metaData.name + '.svg', staticSvg),
			copyAction() {
				copyToClipboard(staticSvg);
			},
		},
		{
			name: 'SMIL SVG',
			description:
        'Enhances SVGs with simple animations using SMIL. Adds a dynamic touch.',
			downloadAction: async () =>
				download(myPathData.metaData.name + '.smil.svg', smilSvg),
			copyAction() {
				copyToClipboard(smilSvg);
			},
		},
		{
			name: 'CSS SVG',
			description:
        'Uses CSS for styling and animating SVG elements. Perfect for web development integration.',
			downloadAction: async () =>
				download(myPathData.metaData.name + '.css.svg', cssSvg),
			copyAction() {
				copyToClipboard(cssSvg);
			},
		},
		{
			name: 'Lottie',
			description:
        '[Experimental Preview] A JSON-based format for complex animations across any platform.',
			downloadAction: async () =>
				download(
					myPathData.metaData.name + '.json',
					JSON.stringify(lottieJson),
				),
			copyAction() {
				copyToClipboard(JSON.stringify(lottieJson));
			},
		},
	];

	return (
		<>
			<SaveAsGif
				isVisible={saveAsGif}
				onClose={() => {
					setSaveAsGif(false);
				}}
				myPathData={myPathData}
			/>
			<ScrollView
				style={styles.container}
				onLayout={() => initControls?.([])}
			>
				<View style={{margin: 10}}>
					<View
						style={{
							width: CANVAS_WIDTH,
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<View
							style={{width: CANVAS_WIDTH - 130, alignSelf: 'flex-start'}}
						>
							<Text
								style={{marginBottom: 10, fontSize: 18, fontWeight: 'bold'}}
							>
                Export Your Paths!
							</Text>
							<Text style={{marginBottom: 5}}>
                Disclaimer: "My Path" is in developmental preview.
							</Text>
							<Text style={{marginBottom: 20}}>
                There are still lots of rough edges. Thank you for your
                understanding.
							</Text>
						</View>
						<View
							style={{
								width: (140 * CANVAS_WIDTH) / CANVAS_HEIGHT,
								height: 140,
								marginRight: 45,
								alignSelf: 'flex-end',
							}}
						>
							<ErrorBoundary>
								<MyPreview
									data={myPathData}
									animate={false}
									// viewBox={CANVAS_VIEWBOX_DEFAULT}
								/>
							</ErrorBoundary>
						</View>
					</View>

					{exportOptions.map((option, index) => (
						<View key={index} style={{marginBottom: 20}}>
							<Text
								style={{fontSize: 16, marginBottom: 5, fontWeight: '900'}}
							>
								{option.name}
							</Text>
							<Text
								style={{fontSize: 14, marginBottom: 5, fontWeight: '300'}}
							>
								{option.description}
							</Text>
							<View style={{flexDirection: 'row'}}>
								{option.downloadAction && (
									<TouchableOpacity onPress={option.downloadAction}>
										<Text style={{color: 'blue', marginBottom: 5}}>
											{option.downloadActionText || 'Download file'}
										</Text>
									</TouchableOpacity>
								)}
								{option.copyAction && (
									<>
										<View
											style={{
												width: 1,
												height: 21,
												borderWidth: 1,
												borderColor: 'rgba(0,0,0,0.5)',
												marginHorizontal: 5,
											}}
										/>
										<TouchableOpacity onPress={option.copyAction}>
											<Text style={{color: 'blue'}}>Copy to clipboard</Text>
										</TouchableOpacity>
									</>
								)}
							</View>
						</View>
					))}

					<Text
						style={{marginTop: 20, fontStyle: 'italic', marginBottom: 10}}
					>
            Have fun!
					</Text>

					<View
						style={{
							width: (350 * CANVAS_WIDTH) / CANVAS_HEIGHT,
							height: 350,
							right: -150,
							top: -50,
							borderWidth: 1,
							borderColor: 'rgba(0,0,0, 0.2)',
						}}
					>
						<Text style={{alignSelf: 'center'}}> Lottie Preview</Text>
						<ErrorBoundary>
							<LottieView
								style={{flex: 1}}
								resizeMode='contain'
								source={lottieJson}
								autoPlay={true}
								loop={true}
							/>
						</ErrorBoundary>
					</View>
				</View>
			</ScrollView>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		padding: 20,
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
	},
	preview: {
		width: 130,
		height: 150,
		alignSelf: 'flex-end',
	},
	section: {
		marginBottom: 20,
	},
});

export default ExportScreen;
