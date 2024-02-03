import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import { SvgDataType, getViewBoxTrimmed } from "./helper";


const AppName = "draw-replay-svg-path";
const AppSaveDirectory = FileSystem.documentDirectory + AppName + "/";

let fileCache: SvgDataType[] | null = null;


function parseSvgData(svgData: any, update_updated_at = false): SvgDataType {

    const isValid = (val) => (val !== null && val !== undefined && (val || val === false));
    ///check if svgData has pathData and if not set default values
    if (!isValid(svgData.pathData)) {
        svgData.pathData = [];
    }
    //chec if pathData is of type PathDataType else set default values
    svgData.pathData = svgData.pathData.map((pathData) => {
        if (!isValid(pathData.stroke)) {
            pathData.stroke = "#000000";
        }
        if (!isValid(pathData.strokeWidth)) {
            pathData.strokeWidth = 2;
        }
        if (!isValid(pathData.length)) {
            pathData.length = 0;
        }
        if (!isValid(pathData.time)) {
            pathData.time = 0;
        }
        if (!isValid(pathData.visible)) {
            pathData.visible = true;
        }
        if (!isValid(pathData.guid)) {
            pathData.guid = Crypto.randomUUID();
        }
        return pathData;
    });
    // check if svgData has metaData and if not set default values
    svgData.metaData = svgData.metaData || {};
    if (!isValid(svgData.metaData.guid)) {
        svgData.metaData.guid = Crypto.randomUUID();
    }
    if (!isValid(svgData.metaData.created_at)) {
        svgData.metaData.created_at = new Date().toISOString();
    }
    if (!isValid(svgData.metaData.updated_at) || update_updated_at) {
        svgData.metaData.updated_at = new Date().toISOString();
    }
    if (!isValid(svgData.metaData.name) || svgData.metaData.name === svgData.metaData.guid) {
        svgData.metaData.name = svgData.metaData.updated_at.split('.')[0].split('T').join(' ');
    }
    if (!isValid(svgData.metaData.viewBox)) {
        svgData.metaData.viewBox = getViewBoxTrimmed(svgData.pathData);
    }
    // console.log(svgData.metaData)

    return svgData;
}

export const saveSvgToFile = async (svgData: SvgDataType, name = "") => {

    // there should be atleast 1 pathData to qualify for saving
    if (svgData.pathData.length < 1) {
        return false;
    }

    // if guid is not yet assigned, this will assign a new guid
    //fill anything missing with default value
    svgData = parseSvgData(svgData, true);

    // Serialize the svgData object to a JSON string
    const json = JSON.stringify(svgData);

    const filename =
        AppSaveDirectory + svgData.metaData.guid + ".json";

    try {
        // Make sure the directory exists
        const dirInfo = await FileSystem.getInfoAsync(AppSaveDirectory);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(AppSaveDirectory, {
                intermediates: true,
            });
        }

        // Write the JSON string to a file
        await FileSystem.writeAsStringAsync(filename, json);
        // console.log("file saved at ", filename);

        // Update the cache
        if (fileCache !== null) {
            const index = fileCache.findIndex(file => file.metaData.guid === svgData.metaData.guid);
            if (index !== -1) {
                fileCache[index] = svgData;
            } else {
                fileCache.push(svgData);
            }
        }


        return true;
    } catch (err) {
        console.error("Failed to save file:", err);
        return false;
        // Handle the error appropriately, e.g. show an error message to the user
    }
};

export const getFiles = async (): Promise<SvgDataType[]> => {
    try {

        // If the cache is not empty, return the cached files
        if (fileCache !== null) {
        // console.log('its from cache', fileCache.length)
         // Sort the files by modification time in descending order
         fileCache.sort((a, b) => Date.parse(b.metaData.updated_at) - Date.parse(a.metaData.updated_at));
            return fileCache;
        }

        const filenames = await FileSystem.readDirectoryAsync(AppSaveDirectory);

        // First time there won't be directory and hence no files

        // Get the metadata for each file
        const svgDataFiles = await Promise.all(
            filenames.map(async (filename) => {
                const info = await FileSystem.getInfoAsync(
                    AppSaveDirectory + "/" + filename
                );
                const json = await FileSystem.readAsStringAsync(info.uri);
                const svgData = parseSvgData(JSON.parse(json));
                return svgData;
                
            })
        );

        // Sort the files by modification time in descending order
        svgDataFiles.sort((a, b) => Date.parse(b.metaData.updated_at) - Date.parse(a.metaData.updated_at));

        // After reading the files, store them in the cache
        fileCache = svgDataFiles;

        return svgDataFiles;
    } catch (err) {
        console.error("Failed to read any file:", err);
        return [];
        // Handle the error appropriately, e.g. show an error message to the user
    }
};


export const getFile = async (guid: string): Promise<SvgDataType | null> => {
    try {

        // If the cache is not empty, try to find the file in the cache
        if (fileCache !== null) {
            const file = fileCache.find(file => file.metaData.guid === guid);
            if (file) {
                return file;
            }
        }

        // Construct the filename from the guid
        const filename = `${guid}.json`; // Adjust this line if your files have a different naming pattern

        // Get the file info
        const info = await FileSystem.getInfoAsync(AppSaveDirectory + "/" + filename);

        // If the file doesn't exist, return null
        if (!info.exists) {
            return null;
        }

        // Read the file content
        const json = await FileSystem.readAsStringAsync(info.uri);
        const svgData = parseSvgData(JSON.parse(json));

        return svgData;
    } catch (err) {
        console.error("Failed to read the file:", err);
        return null;
        // Handle the error appropriately, e.g. show an error message to the user
    }
};
