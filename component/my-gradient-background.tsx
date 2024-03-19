import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/*
<></> --> takes full parent's space by default
<View</View> --> takes only required space by default
<View style={{ flex: 1 }}></View> is same as <></>
*/
const MyGradientBackground = ({ children, reverse = false }) => (
    <>
        <View style={{ ...StyleSheet.absoluteFillObject }}>
            <LinearGradient
                colors={['#512dbb', '#041969', '#020935', '#020935', '#01030f']}
                start={[Number(!reverse), 0]} // left, top
                end={[Number(reverse), 1]}  // right, bottom
                locations={[0, 0.25, 0.45, 0.65, 1]}
                style={{ ...StyleSheet.absoluteFillObject, opacity: 1 }}
            />
        </View>
        {children}
    </>
)

export default MyGradientBackground;