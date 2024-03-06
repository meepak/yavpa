import { GestureStateChangeEvent, GestureUpdateEvent, PanGestureHandlerEventPayload, RotationGestureHandlerEventPayload } from "react-native-gesture-handler";

export const handleSelectedPathRotate = (
    event: GestureStateChangeEvent<RotationGestureHandlerEventPayload>|GestureUpdateEvent<RotationGestureHandlerEventPayload>, 
    state: string) => {
        switch (state) {
            case "began":
                // console.log('selected path rotation began');
                break;
            case "active":
                // console.log('selected path rotation active');
                break;
            case "ended":
                // console.log('selected path rotation end');
                break;
        }
    }
