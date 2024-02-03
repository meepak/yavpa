import { getGreeting } from "@u/helper"
import { View, Text } from "react-native"

const Header = ({totalSavedFiles}) => {
    return (
        <View>
            {/* TODO show Logo */}
            <Text
                style={{
                    color: "black",
                    fontSize: 30,
                    fontWeight: "bold",
                    textAlign: "center",
                    
                }}
            >
                {getGreeting()}!
            </Text>

        <Text>Total Files = {totalSavedFiles}</Text>
        </View>
    )
}

export default Header;