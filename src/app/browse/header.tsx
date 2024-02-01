import { getGreeting } from "@/utilities/helper"
import { View, Text } from "react-native"

const Header = ({totalSavedFiles}) => {
    return (
        <View>
            {/* TOOD show Logo */}
            <Text
                style={{
                    color: "black",
                    fontSize: 30,
                    marginBottom: 15,
                    fontWeight: "bold",
                    textAlign: "center",
                    
                }}
            >
                {getGreeting()}!
            </Text>

        <Text onPress={closeMe}>Total Files = {files.length}</Text>
        </View>
    )
}