import MyGradientBackground from "@c/controls/pure/my-gradient-background";
import MyIcon from "@c/controls/pure/my-icon";
import {LinearGradient} from 'expo-linear-gradient';
import React, {useState, useContext, createContext} from 'react';
import {
	View, Text, StyleSheet, Pressable,
} from 'react-native';
import Animated, {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';

const AnimatedMyIcon = Animated.createAnimatedComponent(MyIcon);
type CollapsibleContextType = {
	openSection?: string;
	setOpenSection?: (openSection: string) => void;
	exclusive?: boolean;
	contentHeight?: number;
};

const CollapsibleContext = createContext<CollapsibleContextType>({});

type MyCollapsibleSectionType = {
	icon?: React.ReactNode;
	title: string;
	contentHeight: number;
	children: React.ReactNode;
};

const MyCollapsibleSection: React.FC<MyCollapsibleSectionType> = ({icon = null, title, contentHeight = 250, children}) => {
	const context = useContext(CollapsibleContext);
	const [localIsOpen, setLocalIsOpen] = useState(false); // Local open state for non-exclusive mode
	const isOpen = context.exclusive ? context.openSection === title : localIsOpen;
	const maxHeight = useSharedValue(0);

	React.useEffect(() => {
		maxHeight.value = contentHeight; // Update maxHeight to the passed height
	}, [contentHeight]);

	// Animated styles for the collapsible part
	const animatedStyles = useAnimatedStyle(() => ({
		height: withTiming(isOpen ? maxHeight.value : 0, {
			duration: 320,
		}),
		overflow: 'hidden',
	}));

	// Animated styles for the content opacity
	const animatedContentStyles = useAnimatedStyle(() => ({
		translateY: withTiming(isOpen ? 0 : -contentHeight, {
			duration: 420,
		}),
		opacity: withTiming(isOpen ? 1 : 0, {
			duration: 300,
		}),
	}), [isOpen]);

	// Animated icon style to rotate while the content is opening or closing
	const animatedIconStyle = useAnimatedStyle(() => ({
		transform: [{
			rotate: withTiming(isOpen ? '0deg' : '180deg', {duration: 420}),
		}],
	}), [isOpen]);

	// Function to toggle section open/close
	const toggleSection = () => {
		if (context.exclusive) {
			if (context.setOpenSection) {
				context.setOpenSection(isOpen ? '' : title);
			}
		} else {
			// Toggle local open state for non-exclusive mode
			setLocalIsOpen(!localIsOpen);
		}
	};

	const Header = () => (
		<View style={{backgroundColor: '#512FDC'}}>
			<MyGradientBackground style={{opacity: 0.8}}>
				<Pressable
					onPress={toggleSection}
					style={({pressed}) => [
						styles.titleBar,
						{opacity: pressed ? 0.5 : 1},
					]}
				>
					<View style={{
						flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%',
					}}>
						<View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 5}}>
							<View style={{width: 24}}>{icon}</View>
							<Text style={styles.titleText}>{title}</Text>
						</View>
						<Animated.View style={animatedIconStyle} >
							<AnimatedMyIcon name={'expand-more'} size={24} color='#FFFFFF' fill='transparent' strokeWidth={1} />
						</Animated.View>
					</View>
				</Pressable>
			</MyGradientBackground>
		</View>
	);

	return (
		<View style={{flex: 1, marginBottom: 10}}>
			<Header />
			<Animated.View style={[animatedStyles, styles.contentContainer]}>
				<Animated.View style={{marginBottom: 5, ...animatedContentStyles}}>
					{children}
				</Animated.View>
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	titleBar: {
		width: '100%',
		height: 42,
		justifyContent: 'space-between',
		alignItems: 'center',
		flexDirection: 'row',
		paddingHorizontal: 10,
		borderRadius: 5,
	},
	titleText: {
		color: 'white',
		fontWeight: 'bold',
		marginLeft: 13,
	},
	contentContainer: {
		backgroundColor: 'white',
		overflow: 'hidden',
	},
});

// Further simplified way to access this component

type MyCollapsibleProperty = {
	exclusive?: boolean;
	data: Array<{
		icon?: React.ReactNode;
		title: string;
		contentHeight: number;
		content: React.ReactNode;
	}>;
};
const MyCollapsible = (property: MyCollapsibleProperty) => {
	const [openSection, setOpenSection] = useState('');

	return (
		<CollapsibleContext.Provider value={{openSection, setOpenSection, exclusive: property.exclusive || true}}>
			{property.data.map((item, index) => (
				<MyCollapsibleSection key={index} icon={item.icon} title={item.title} contentHeight={item.contentHeight}>
					{item.content}
				</MyCollapsibleSection>
			))}
		</CollapsibleContext.Provider>
	);
};

export default MyCollapsible;

// New Usage:
// <MyCollapsible exclusive={true} data={[...]} />
//
// ------------------------------
// export { MyCollapsibleSection, CollapsibleContext };
// Old Usage:
// <CollapsibleContext.Provider
//     value={{
//              openSection,
//              setOpenSection,
//              exclusive: true //allows to open only one section at a time
//          }}>
//     <MyCollapsibleSection title='First Title'} height={200}>
//         <Text>My Content</Text>
//     </MyCollapsibleSection>
//     <MyCollapsibleSection title='Second Title'  height={200}>
//         <Text>My Content</Text>
//     </MyCollapsibleSection>
// </CollapsibleContext.Provider>

// NOTE: We are not doing dynamic height measurement for time being.
// May be this can be referenced for future if need arises.

// const [contentHeight, setContentHeight] = useState(0);

// const maxHeight = useSharedValue(0);

// useEffect(() => {
//     myConsole.log('contentHeight', contentHeight);
//     myConsole.log('maxHeight', maxHeight.value);
// },[contentHeight])

// const MeasureMirrorChildren = () => {
//     const contentHeightRef = useRef(0);
//      const [key, setKey] = useState(Math.random());
//      useEffect(() => {
//          setKey(Math.random());
//       }, [children]); // Change the key prop whenever the children prop changes

//     const setHeight = (height) => {
//         if (height > contentHeightRef.current) {
//             contentHeightRef.current = height;
//         } else {
//             maxHeight.value = height
//             setContentHeight(contentHeightRef.current);
//         }
//     };

//     return (<View
//         style={{position: 'absolute', left: -2 * SCREEN_WIDTH, top: -2 * SCREEN_HEIGHT }}
//         onLayout={(event) => {
//                 const height = event.nativeEvent.layout.height;
//                 console.log(height);
//                 setHeight(height);
//             }} >
//         {children}
//     </View >
//     )
// }

