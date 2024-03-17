import * as FileSystem from "expo-file-system";
import { parseSvgData } from "./helper";
import { SvgDataType, I_AM_IOS } from "./types";
import path from 'path';

// const AppName = I_AM_IOS ? "mypath.mahat.au" : "draw-replay-svg-path";
const AppName = 'jpt'; //isIOS ? "mypath.mahat.au" : "draw-replay-svg-path";
const AppSaveDirectory = FileSystem.documentDirectory + AppName + "/";

let fileCache: SvgDataType[] = [];
let saveTimeout: NodeJS.Timeout;

export const saveSvgToFile = async (svgData: SvgDataType, name = "") => {
    svgData = parseSvgData(svgData, true);
    const index = fileCache.findIndex(file => file.metaData.guid === svgData.metaData.guid);
    if (index !== -1) {
        // Move the updated file to the top of the cache
        fileCache[index] = svgData;
    } else {
        if(svgData.pathData.length === 0) return;
        fileCache.push(svgData); // Add new or updated file to the top of the cache
    }

    // Clear the previous timeout
    // console.log('clearing timeout.');
    clearTimeout(saveTimeout);

    // console.log('saving file in 2 seconds.');
    // Set a new timeout
    saveTimeout = setTimeout(async () => {
        try {
            const json = JSON.stringify(svgData);
            const filename = path.join(AppSaveDirectory, `${svgData.metaData.guid}.json`);

            const dirInfo = await FileSystem.getInfoAsync(AppSaveDirectory);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(AppSaveDirectory, { intermediates: true });
            }

            await FileSystem.writeAsStringAsync(filename, json);
            console.log('*****FILE SAVED TO DISK***')
        } catch (err) {
            console.error("Failed to save file:", err);
        }
    }, 2000); // Delay of 1 second
};
// lets include defaults first time and then it becomes part of user files that they are free to do whatever
// can be brought back from settings if user wants it
export const getFiles = async (includeDefaults = true): Promise<SvgDataType[]> => {
    try {
        if (fileCache.length > 0) {
            console.log('file cache get files')
            return fileCache;
        }
        console.log('I should never be reached after first time.');
        const dirInfo = await FileSystem.getInfoAsync(AppSaveDirectory);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(AppSaveDirectory, { intermediates: true });
            return [];
        }

        const filenames = await FileSystem.readDirectoryAsync(AppSaveDirectory);
        const svgDataFiles: SvgDataType[] = [];

        for (const filename of filenames) {
            const info = await FileSystem.getInfoAsync(path.join(AppSaveDirectory, filename));
            const json = await FileSystem.readAsStringAsync(info.uri);
            const svgData = parseSvgData(JSON.parse(json));
            svgDataFiles.push(svgData);
        }
        console.log('set the filecache again..')
        // svgDataFiles.sort((a, b) => Date.parse(b.metaData.updatedAt) - Date.parse(a.metaData.updatedAt));

        if (includeDefaults) {

            const logoData = require('@c/logo/my-path.json');
            if (logoData && logoData.pathData.length > 0) {
                // check a copy already exist or not
                const index = svgDataFiles.findIndex(file => file.metaData.guid === logoData.metaData.guid);
                if (index === -1) {
                    svgDataFiles.push(logoData);
                }
            }
            const creativeVoidData = require('@c/creative-void/creative-void.json');
            if (creativeVoidData && creativeVoidData.pathData.length > 0) {
                const index = svgDataFiles.findIndex(file => file.metaData.guid === logoData.metaData.guid);
                if (index === -1) {
                    svgDataFiles.push(creativeVoidData);
                }
            }
        }

        fileCache = svgDataFiles;
        return svgDataFiles;
    } catch (err) {
        console.error("Failed to read any file:", err);
        return [];
    }
}


export const getFile = async (guid: string): Promise<SvgDataType | null> => {
    try {
        const file = fileCache.find(file => file.metaData.guid === guid);
        if (file) {
            // reset selected path to false, find betteer way
            file.pathData.forEach(path => path.selected = false);
            return file;
        }
        console.log('file not found in cache');

        const filename = path.join(AppSaveDirectory, `${guid}.json`);
        const info = await FileSystem.getInfoAsync(filename);

        if (!info.exists) {
            return null;
        }

        const json = await FileSystem.readAsStringAsync(info.uri);
        const svgData = parseSvgData(JSON.parse(json));
        fileCache.push(svgData);
        return svgData;
    } catch (err) {
        console.error("Failed to read the file:", err);
        return null;
    }
}


export const deleteFile = async (guid: string): Promise<boolean> => {
    try {
        const filename = path.join(AppSaveDirectory, `${guid}.json`);
        await FileSystem.deleteAsync(filename);
        fileCache = fileCache.filter(file => file.metaData.guid !== guid);
        return true;
    } catch (err) {
        console.error("Failed to delete the file:", err);
        return false;
    }
};

