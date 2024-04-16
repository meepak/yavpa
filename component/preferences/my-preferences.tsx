import {useState} from 'react';
import MySheetModal from '@c/controls/my-sheet-modal';
import {HEADER_HEIGHT, SCREEN_HEIGHT} from '@u/types';
import {Text, StyleSheet, ScrollView} from 'react-native';
import MyCollapsible from '@c/controls/my-collapsible';
import MyIcon from '@c/my-icon';
import StoragePreferences from './storage-preferences';
import DrawingPreferences from './drawing-preferences';

type MyPreferencesProperties = {
	isVisible: boolean;
	onClose?: () => void;
};
const MyPreferences: React.FC<MyPreferencesProperties> = ({isVisible, onClose}) => {
	const modalHeight = SCREEN_HEIGHT - HEADER_HEIGHT - 15;
	const [parentScrollEnabled, setParentScrollEnabled] = useState(false);
	return (
		<MySheetModal
			isVisible={isVisible}
			height={modalHeight}
			onClose={() => {
				onClose && onClose();
			}}
			icon={<MyIcon name='user-preferences' size={28} strokeWidth={1} fill='#FFFFFF' color='#FFFFFF' />}
			title='My Preferences'
			swipeToClose={false}
		>
			<ScrollView
				style={StyleSheet.absoluteFill}
				scrollEnabled={parentScrollEnabled}

			>
				<MyCollapsible
					exclusive={true}
					data={
						[
							{
								icon: <MyIcon name='storage' size={18} strokeWidth={1} fill='#ffffff' color='#512dab' />,
								title: 'Storage',
								contentHeight: 450,
								content: <StoragePreferences disableParentScroll={(value: boolean) => {
									setParentScrollEnabled(!value);
								}}/>,
							},
							// {
							//     icon: <MyIcon name="calibration" style={{ transform: "translate(-2,0)" }} size={20} strokeWidth={0.75} fill="#512dab" color="#ffffff" />,
							//     title: 'Calibiration',
							//     contentHeight: 400,
							//     content: <DeviceCalibration />
							// },
							{
								icon: <MyIcon name='pen' size={24} strokeWidth={1} fill='#512dab' color='#ffffff' />,
								title: 'Drawing',
								contentHeight: 500,
								content: <DrawingPreferences disableParentScroll={(value: boolean) => {
									setParentScrollEnabled(!value);
								}}/>,
							},
							{
								icon: <MyIcon name='preview' style={{transform: 'translate(-1,0)'}} size={24} strokeWidth={0.75} fill='#512dab' color='#ffffff' />,
								title: 'Animation',
								contentHeight: 150,
								content: <Text>My Preferences</Text>,
							},
							{
								icon: <MyIcon name='export' style={{transform: 'translate(-1,0)'}} size={24} strokeWidth={0.75} fill='#512dab' color='#ffffff' />,
								title: 'Export',
								contentHeight: 150,
								content: <Text>My Preferences</Text>,
							},
						]
					}
				/>

			</ScrollView>
		</MySheetModal>
	);
};

export default MyPreferences;
