import { ToastFunction } from '@x/toast-context';
import * as ImagePicker from 'expo-image-picker';
import { saveImageToCache } from './storage';
import myConsole from '@c/my-console-log';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './types';

export const pickImageAsync = async (documentDir: string, showToast: ToastFunction): Promise<any | null> => {
    let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        allowsMultipleSelection: false,
        quality: 0.75,
        aspect: [CANVAS_WIDTH, CANVAS_HEIGHT],
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        // resize to less than 1MB
    });

    if (!result.canceled && result.assets.length > 0) {
        // let copy the file to our app's cache directory
        const asset = result.assets[0];
        const imageJson = await saveImageToCache(documentDir, asset.uri, asset.height, asset.width);
        // myConsole.log(imageJson);
        return imageJson;
    } else {
        showToast('You did not select any image.');
        return null;
    }
};