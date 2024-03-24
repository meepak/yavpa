import * as FileSystem from "expo-file-system";
import { parseMyPathData } from "./helper";
import { MyPathDataType, CANVAS_WIDTH, CANVAS_HEIGHT } from "./types";
import path from 'path';
import myConsole from "@c/my-console-log";
import * as Crypto from 'expo-crypto';
import * as ImageManipulator from "expo-image-manipulator";

// const AppName = I_AM_IOS ? "mypath.mahat.au" : "draw-replay-svg-path";
const AppName = 'mypath1.mahat.au'; //isIOS ? "mypath.mahat.au" : "draw-replay-svg-path";
const AppSaveDirectory = FileSystem.documentDirectory + AppName + "/";

let fileCache: MyPathDataType[] = [];
let saveTimeout: NodeJS.Timeout;

// This are all json files
const myPathFileExt = '.mp';
const myPathImageExt = '.mpi';
const myPathFile = (guid: string) => path.join(AppSaveDirectory, `${guid}` + myPathFileExt);
const myPathImage = (guid: string) => path.join(AppSaveDirectory, `${guid}` + myPathImageExt);

export const saveSvgToFile = async (myPathData: MyPathDataType, name = "") => {
    myPathData = parseMyPathData(myPathData, true);
    const index = fileCache.findIndex(file => file.metaData.guid === myPathData.metaData.guid);
    if (index !== -1) {
        // Move the updated file to the top of the cache
        fileCache[index] = myPathData;
    } else {
        if (myPathData.pathData.length === 0) return;
        fileCache.push(myPathData); // Add new or updated file to the top of the cache
    }

    // Clear the previous timeout
    // myConsole.log('clearing timeout.');
    clearTimeout(saveTimeout);

    // myConsole.log('saving file in 2 seconds.');
    // Set a new timeout
    saveTimeout = setTimeout(async () => {
        try {
            const json = JSON.stringify(myPathData);
            // const filename = path.join(AppSaveDirectory, `${myPathData.metaData.guid}.json`);
            const filename = myPathFile(myPathData.metaData.guid);

            const dirInfo = await FileSystem.getInfoAsync(AppSaveDirectory);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(AppSaveDirectory, { intermediates: true });
            }

            await FileSystem.writeAsStringAsync(filename, json);
            myConsole.log('*****FILE SAVED TO DISK***')
        } catch (err) {
            console.error("Failed to save file:", err);
        }
    }, 2000); // Delay of 1 second
};
// lets include defaults first time and then it becomes part of user files that they are free to do whatever
// can be brought back from settings if user wants it
export const getFiles = async (): Promise<MyPathDataType[]> => {
    try {
        if (fileCache.length > 0) {
            myConsole.log('file cache get files')
            return fileCache;
        }
        myConsole.log('I should never be reached after first time.');
        const dirInfo = await FileSystem.getInfoAsync(AppSaveDirectory);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(AppSaveDirectory, { intermediates: true });
            return [];
        }

        const filenames = await FileSystem.readDirectoryAsync(AppSaveDirectory);

        // Get json files only
        const myPathFiles = filenames.filter(filename => filename.endsWith(myPathFileExt));

        const myPathDataFiles: MyPathDataType[] = [];

        if (myPathFiles.length === 0) {
            myConsole.log('we have no file, lets load the demo file');
            const logoFile = require('@c/logo/my-path-demo.json');

            // if (logoData && { ...logoData }.pathData.length > 0) {
            //     // check a copy already exist or not
            //     const index = myPathDataFiles.findIndex(file => file.metaData.guid === logoData.metaData.guid);
            //     if (index === -1) {

            //     }
            // }
            const demoFile = JSON.parse(JSON.stringify(logoFile))
            const logoData = parseMyPathData(demoFile);
            myPathDataFiles.push(logoData);
            // const creativeVoidData = require('@c/creative-void/creative-void.json');
            // if (creativeVoidData && {...creativeVoidData}.pathData.length > 0) {
            //     const index = myPathDataFiles.findIndex(file => file.metaData.guid === logoData.metaData.guid);
            //     if (index === -1) {
            //         myPathDataFiles.push({ ...creativeVoidData, metaData: { ...creativeVoidData.metaData, updatedAt: new Date().toISOString() } });
            //     }
            // }
        } else {
            console.log('we have files, /lets load them - ', myPathFiles);
            for (const svgFile of myPathFiles) {
                const info = await FileSystem.getInfoAsync(path.join(AppSaveDirectory, svgFile));
                const json = await FileSystem.readAsStringAsync(info.uri);
                const myPathData = parseMyPathData(JSON.parse(json));
                myPathDataFiles.push(myPathData);
            }
        }
        myConsole.log('set the filecache again..')
        // myPathDataFiles.sort((a, b) => Date.parse(b.metaData.updatedAt) - Date.parse(a.metaData.updatedAt));



        fileCache = myPathDataFiles;
        return myPathDataFiles;
    } catch (err) {
        console.error("Failed to read any file:", err);
        return [];
    }
}


export const getFile = async (guid: string): Promise<MyPathDataType | null> => {
    try {
        const file = fileCache.find(file => file.metaData.guid === guid);
        if (file) {
            // reset selected path to false, find betteer way
            file.pathData.forEach(path => path.selected = false);
            myConsole.log('file found in fileCache');
            return file;
        }
        myConsole.log('file not found in cache');

        const filename = myPathFile(guid);
        const info = await FileSystem.getInfoAsync(filename);

        if (!info.exists) {
            return null;
        }

        const json = await FileSystem.readAsStringAsync(info.uri);
        const myPathData = parseMyPathData(JSON.parse(json));
        fileCache.push(myPathData);
        return myPathData;
    } catch (err) {
        console.error("Failed to read the file:", err);
        return null;
    }
}


export const deleteFile = async (guid: string): Promise<boolean> => {
    try {
        const filename = myPathFile(guid);
        await FileSystem.deleteAsync(filename);
        fileCache = fileCache.filter(file => file.metaData.guid !== guid);
        return true;
    } catch (err) {
        console.error("Failed to delete the file:", err);
        return false;
    }
};

// deal with images, for now only 1 image as background can be used
export const saveImageToCache = async (filePath: string, height: number, width: number): Promise<any | null>  => {
    const lookupTablePath = path.join(AppSaveDirectory, 'lookupTable.txt');
    const filename = path.join(filePath);
    const extension = path.extname(filePath);

    // TODO maintain allowed list of file types and check

    const resizedImage = await ImageManipulator.manipulateAsync(
        filename,
        [{ resize: { height: CANVAS_HEIGHT } }],
        { base64: true, compress: 0.9, format: ImageManipulator.SaveFormat.PNG }
    );
    const base64Data = `data:image/png;base64,${resizedImage.base64}`;
    const dataHash = base64Data && await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, base64Data);


    // Check if the file already exists in the cache
    // check if lookup table exist
    const lookupTableInfo = await FileSystem.getInfoAsync(lookupTablePath);
    let lookupTable = '';
    if (!lookupTableInfo.exists) {
        await FileSystem.writeAsStringAsync(lookupTablePath, '');
    } else {
        lookupTable = await FileSystem.readAsStringAsync(lookupTablePath);
        const lines = lookupTable.split('\n');
        for (const line of lines) {
            const [existingHash, existingGuid] = line.split(',');
            if (existingHash === dataHash) {
                const existingImage = await FileSystem.readAsStringAsync(myPathImage(existingGuid))
                return JSON.parse(existingImage) as any;
            }
        }
    }


    const content = {
        data: base64Data,
        width: width,
        height: height,
        hash: dataHash,
        guid: Crypto.randomUUID()
    }

    // console.log('content', content);

    // If no match was found, write a new file
    const imagePath = myPathImage(content.guid);
    await FileSystem.writeAsStringAsync(imagePath, JSON.stringify(content));

    // Add the new hash and GUID to the lookup table
    const updatedLookupTable = `${lookupTable}${content.hash},${content.guid}\n`;
    await FileSystem.writeAsStringAsync(lookupTablePath, updatedLookupTable);

    return content;
};


// export const getImage =  async (guid: string): Promise<any|null> => {
//     const filename = myPathImage(guid);
//     const info = await FileSystem.getInfoAsync(filename);

//     if (!info.exists) {
//         return null;
//     }

//     const imageJson = await FileSystem.readAsStringAsync(filename);

//     return JSON.parse(imageJson);
// }
