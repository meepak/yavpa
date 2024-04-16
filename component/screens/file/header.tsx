import React, {useContext, useEffect, useState} from 'react';
import {
	TextInput, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import {useRouter} from 'expo-router';
import {ControlPanel} from 'component/controls';
import {
	BLUE_BUTTON_WIDTH, FOOTER_HEIGHT, HEADER_HEIGHT, SCREEN_HEIGHT, ScreenModes,
} from '@u/types';
import MyIcon from '@c/my-icon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MyPathLogo from '@c/logo/my-path-logo';
import {MyPathDataContext} from '@x/svg-data';
import MyList from '@c/my-list';
import MyBlueButton from '@c/my-blue-button';
import {ToastContext} from '@x/toast-context';
import MyGradientBackground from '@c/my-gradient-background';
import myConsole from '@c/my-console-log';

const Header = ({
	title,
	onTitleChange,
	controlPanelButtons,
	initialScreenMode,
	onScreenModeChanged,
}) => {
	const insets = useSafeAreaInsets();
	const [name, setName] = useState(title);
	const [screenMode, setScreenMode] = useState(initialScreenMode || ScreenModes[0]);
	const {myPathData} = useContext(MyPathDataContext);
	// Const [buttonInstruction, setButtonInstruction] = useState("");
	const router = useRouter();
	const {showToast} = useContext(ToastContext);

	useEffect(() => {
		setName(title);
	}, [title]);

	// Change -- let just toggle between draw and preview
	// Put dedicated button for export within preview

	const handleScreenModeButtonPress = () => {
		// MyConsole.log('screen mode button pressed')
		const currentScreenModeIndex = ScreenModes.findIndex(mode => mode.name === screenMode.name);
		if (currentScreenModeIndex >= 0 && ScreenModes[currentScreenModeIndex].name === 'Draw') {
			// Get count of visible paths
			const pathsOnScreen = myPathData.pathData.reduce((accumulator, path) => path.visible ? accumulator + 1 : accumulator, 0);
			if (pathsOnScreen === 0) {
				showToast('Please draw something first!');
				return;
			}
		}

		// Const newScreenModeIndex = (currentScreenModeIndex + 1) % ScreenModes.length;
		const newScreenModeIndex = currentScreenModeIndex === 0 ? 1 : 0;
		const newScreenMode = ScreenModes[newScreenModeIndex];
		setScreenMode(newScreenMode);
		// SetButtonInstruction(ScreenModeInstruction[newScreenMode.name]);
		onScreenModeChanged?.(newScreenMode);
	};

	const handleBackButtonPress = () => {
		// MyConsole.log('baack pressed')
		// if (router.canGoBack()) {
		//     router.back()
		// }
		// else {
		//     router.navigate("/browse")
		// }
		router.navigate('/browse');
	};

	// To get the same top position iOS  has insets.top included within header size
	// whereas in android it's not???
	// flatlist has to be bring down by 15 in iOS to align with bottom line
	const getBlueButtonIconProperties = screenMode => {
		// Replae Draw with Press to Animate
		// replace Preview with Press to Export
		// replace Export with Press to Edit
		let desc = screenMode.name;
		const name = screenMode.icon;
		switch (screenMode.name) {
			case 'Draw': {
				desc = 'press to PLAY';

				break;
			}

			case 'Preview': {
				desc = 'press to EDIT';

				break;
			}

			case 'Export': {
				desc = 'press to DRAW';

				break;
			}

			case 'locked': {
				desc = 'Press to UNLOCK';

				break;
			}
		// No default
		}

		return {desc, name, size: 24};
	};

	const textInputHeight = 40;
	const blueButtonTop = HEADER_HEIGHT - BLUE_BUTTON_WIDTH / 3;
	return (
		<View style={{
			height: HEADER_HEIGHT, zIndex: 10_000, elevation: 9, overflow: 'visible',
		}} >
			<MyGradientBackground>
				<View style={{flex: 1, justifyContent: 'space-between'}}>
					<View
						style={{
							top: insets.top,
							marginRight: 10,
							marginLeft: 10,
							flexDirection: 'row',
							alignItems: 'center',
							alignContent: 'center',
							justifyContent: 'space-between',
							backgroundColor: 'transparent',
						}}
					>
						<TouchableOpacity onPress={handleBackButtonPress} activeOpacity={0.75} style={{alignSelf: 'center'}}>
							<MyIcon name='back' color='#FFFFFF' strokeWidth={2} size={24} />
						</TouchableOpacity>
						<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
							<View style={{alignSelf: 'center'}}>
								<TextInput
									style={{
										flex: 1,
										height: textInputHeight,
										color: 'rgba(255, 255, 255, 0.7)',
										fontSize: 17,
										fontWeight: '300',
										textAlign: 'center',
										paddingLeft: 10,
									}}
									onChangeText={setName}
									onEndEditing={e => {
										if (onTitleChange) {
											onTitleChange(e.nativeEvent.text);
										}
									}}
									value={name}
									placeholder='Title'
									enterKeyHint='done'
									placeholderTextColor='rgba(255, 255, 255, 0.8)'
								/>
							</View>
						</TouchableWithoutFeedback>
						<View style={{bottom: -5}}>
							<MyList
								anchor={<MyPathLogo animate={false} width={36} height={36} />}
								width={150}
								height={SCREEN_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT}
							/>
						</View>

					</View>
					<View style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
						<ControlPanel
							buttons={controlPanelButtons}
							paddingLeft={85}
							paddingRight={10}
						/>
					</View>
				</View>
			</MyGradientBackground>
			<MyBlueButton
				icon={getBlueButtonIconProperties(screenMode)}
				onPress={handleScreenModeButtonPress}
				aligned='left'
				top={blueButtonTop}
			/>
		</View>
	);
};

export default Header;
