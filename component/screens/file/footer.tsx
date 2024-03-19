import { View, Text } from "react-native"
import { HeaderGradientBackground } from "./header";
import { FOOTER_HEIGHT } from "@u/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Footer = () => {
    const insets = useSafeAreaInsets();
    return (
            <View style={{
                position: 'absolute',
                bottom: insets.bottom,
                left: 0,
                right: 0,
                height: FOOTER_HEIGHT,
                borderWidth: 1,
                backgroundColor: 'red',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                borderTopWidth: 1,
                borderTopColor: '#4f236d',
                zIndex: 9999,
            }} >
        {/* <HeaderGradientBackground> */}
                <Text style={{ color: '#FFFFFF' }}>Path Statistics</Text>
        {/* </HeaderGradientBackground> */}
            </View>
    )
}

export default Footer;