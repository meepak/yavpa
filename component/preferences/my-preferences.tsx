import MySheetModal from "@c/controls/my-sheet-modal";
import { HEADER_HEIGHT, SCREEN_HEIGHT } from "@u/types";
import { Text, StyleSheet, ScrollView } from "react-native";
import MyCollapsible, {  } from "@c/controls/my-collapsible-section";
import StoragePreferences from "./storage-preferences";
import MyIcon from "@c/my-icon";



interface MyPreferencesProps {
    isVisible: boolean;
    onClose?: () => void;
}
const MyPreferences: React.FC<MyPreferencesProps> = ({ isVisible, onClose }) => {
    const modalHeight = SCREEN_HEIGHT - HEADER_HEIGHT - 15;
    return (
        <MySheetModal
            isVisible={isVisible}
            height={modalHeight}
            onClose={() => { onClose && onClose() }}
            icon={<MyIcon name="user-preferences" size={28} strokeWidth={1} fill="#FFFFFF" color="#FFFFFF" />}
            title="My Preferences"
            swipeToClose={false}
        >
            <ScrollView style={StyleSheet.absoluteFill}>
                <MyCollapsible
                    exclusive={true}
                    data={
                        [
                            {
                                title: 'Storage',
                                contentHeight: 450,
                                content: <StoragePreferences />,
                            },
                            {
                                title: 'Drawing Pointer',
                                contentHeight: 450,
                                content: <Text>My Preferences</Text>
                            },
                            {
                                title: 'Misc',
                                contentHeight: 450,
                                content: <Text>My Preferences</Text>
                            }
                        ]
                    }
                    />

            </ScrollView>
        </MySheetModal>
    );
}

export default MyPreferences;
