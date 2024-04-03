import { View, ViewStyle, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/*
<></> --> takes full parent's space by default
<View</View> --> takes only required space by default
<View style={{ flex: 1 }}></View> is same as <></>
*/
type PointerEventTypes = "box-none" | "none" | "box-only" | "auto" | undefined;

interface MyGradientBackgroundProps {
    children?: React.ReactNode;
    reverse?: boolean;
    style?: ViewStyle;
    pointerEvents?: PointerEventTypes;
}

const MyGradientBackground: React.FC<MyGradientBackgroundProps> = ({ children, reverse = false, style = {}, pointerEvents = undefined }) => (
    <>
        <View style={{ ...StyleSheet.absoluteFillObject, ...style }} pointerEvents={pointerEvents}>
            <LinearGradient
                colors={['#512dab', '#041969', '#020935', '#020935', '#01030f']}
                start={[Number(!reverse), 0]} // left, top
                end={[Number(reverse), 1]}  // right, bottom
                locations={[0, 0.25, 0.45, 0.65, 1]}
                style={{ ...StyleSheet.absoluteFillObject, opacity: 1, ...style }} pointerEvents={pointerEvents}
            />
        </View>
        {children}
    </>
)

export default MyGradientBackground;