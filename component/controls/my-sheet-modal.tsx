import MyGradientBackground from '@c/my-gradient-background';
import MyIcon from '@c/my-icon';
import React, {type ReactNode} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';

type MySheetModalProperties = {
	isVisible: boolean;
	title: string;
	icon?: ReactNode;
	children: ReactNode;
	height: number;
	swipeToClose?: boolean;
	onClose: () => void;
};

const headerHeight = 50;
const MySheetModal = React.forwardRef<React.RefObject<Modal>, MySheetModalProperties>(({isVisible, title, icon, height, onClose, swipeToClose = true, children}, reference) => (
	<Modal
		isVisible={isVisible}
		style={{
			margin: 0,
		}}
		onBackdropPress={onClose}
		onBackButtonPress={onClose}
		onSwipeComplete={swipeToClose ? onClose : undefined}
		swipeDirection={swipeToClose ? ['down'] : undefined}
		backdropOpacity={0}
		backdropColor={'black'}
		animationInTiming={500}
		animationOutTiming={500}
		useNativeDriver={true}
		hideModalContentWhileAnimating={true}
		propagateSwipe={false}
	>
		<View style={{
			flex: 1,
			justifyContent: 'flex-end',
			backgroundColor: 'transparent',
		}}
		pointerEvents='box-none'
		>
			<View style={{
				height: headerHeight,
				width: '100%',
				borderTopLeftRadius: 20,
				borderTopRightRadius: 20,
			}}
			>
				<MyGradientBackground style={{
					borderTopLeftRadius: 20,
					borderTopRightRadius: 20,
				}}
				>
					<View style={{flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between'}}>
						<View style={{
							flexDirection: 'row', alignSelf: 'flex-start', alignContent: 'center', justifyContent: 'flex-start',
						}}>
							{icon && <View style={{alignSelf: 'flex-start', left: 15, bottom: -10}}>
								{icon}
							</View>}
							<Text style={{
								color: 'white',
								alignSelf: 'flex-start',
								paddingLeft: 30,
								paddingTop: 15,
							}}>{title || 'My Sheet Modal'}</Text>
						</View>
						<View style={{right: 15, bottom: 4, alignSelf: 'flex-end'}}>
							<TouchableOpacity onPress={() => {
								onClose && onClose();
							}} style={{backgroundColor: 'transparent', top: 5}}>
								<MyIcon name='ok' />
							</TouchableOpacity>
						</View>

					</View>
				</MyGradientBackground>
			</View>
			<View
				style={{
					backgroundColor: 'white', // Allow to customize
					padding: 5,
					height: height - headerHeight, // Change this to control the height of the modal
					justifyContent: 'center',
					alignItems: 'center',
				}}>
				<View
					style={{
						flex: 1,
						width: '100%',
						height: '100%',
						padding: 5,
					}}>
					{children}
				</View>
			</View>
		</View>
	</Modal>
));

export default MySheetModal;
