import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { UserPreferencesContext } from '@x/user-preferences';
import { getAppSavePath, myPathFileExt, myPathImageExt } from '@u/storage';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';
import { Divider } from '@c/controls';
import { MY_BLACK, SCREEN_WIDTH } from '@u/types';
import { precise } from '@u/helper';
import myConsole from '@c/my-console-log';
import MyIcon from '@c/my-icon';


const StoragePreference = () => {
    const { userPreferences, setUserPreferences } = useContext(UserPreferencesContext);
    const [newDirName, setNewDirName] = useState('');
    // const [directories, setDirectories] = useState<string[]>([]);
    // const [fileCount, setFileCounts] = useState<number[]>([]);
    // const [dirInfo, setDirInfo] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const rootDirPath = useRef('');
    const directories = useRef<string[]>([]);
    const filesCount = useRef<number[]>([]);
    const imagesCount = useRef<number[]>([]);
    const totalSpace = useRef(0);
    const freeSpace = useRef(0);
    const filesSize = useRef<number[]>([]);


    useEffect(() => {
        initialize();
    }, []);

    const initialize = () => {
        setLoading(true);
        const getDirs = async (rootDir) => {
            const dirs = await FileSystem.readDirectoryAsync(rootDir);
            dirs.forEach(async (dir, index) => {
                if (dir.startsWith('mypath')) {
                    const fullDir = getAppSavePath(dir);
                    const dirInfo = await FileSystem.getInfoAsync(fullDir, { size: true });
                    // if(dir.endsWith('.zip')) console.log(dir);
                    // check if dir is a directory
                    if (dirInfo.isDirectory) {
                        directories.current[index] = dir;
                        FileSystem.readDirectoryAsync(fullDir).then((files) => {
                            imagesCount.current[index] = files.filter((file) => file.endsWith(myPathImageExt)).length;
                            filesCount.current[index] = files.filter((file) => file.endsWith(myPathFileExt)).length;
                        });
                        filesSize.current[index] = dirInfo.size;
                    }
                }
            });
            freeSpace.current = await FileSystem.getFreeDiskStorageAsync();
            totalSpace.current = await FileSystem.getTotalDiskCapacityAsync();
            setLoading(false);
        };

        rootDirPath.current = FileSystem.documentDirectory || '';
        if (rootDirPath.current === '') {
            throw new Error('No root directory found, probably permission required'); // TODO HANDLE THIS PROPERLY
        }
        getDirs(rootDirPath.current);
    }

    const handleDirectoryChange = (dirName) => {
        // console.log('saving directory changes to ', dirName);
        setUserPreferences((prev) => ({ ...prev, defaultStorageDirectory: dirName }));
    };

    const handleNewDirSubmit = async () => {
        let newDir = newDirName.trim();
        if(newDir === '') return;
        const prefix = 'mypath.'
        const appSaveDir = getAppSavePath(prefix + newDir);
        try {
            const dirInfo = await FileSystem.getInfoAsync(appSaveDir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(appSaveDir, { intermediates: true });
            } else {
                Alert.alert('Directory already exists', 'Please enter a different name');
                return;
            }
            setNewDirName(''); // Clear the input
            initialize();
        } catch (error) {
            console.error('Error creating directory:', error);
        }
    };

    const handleDeleteDir = async (dir) => {
        const appSaveDir = getAppSavePath(dir);
        // ask for alert confirmation
        Alert.alert("Delete Directory", "Are you sure you want to delete this directory permanently?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                onPress: async () => {
                    await deleteDirectory(appSaveDir);
                },
            },
        ]);

        const deleteDirectory = async (appSaveDir) => {
            try {
                await FileSystem.deleteAsync(appSaveDir, { idempotent: true });
                if (dir === userPreferences.defaultStorageDirectory) {
                    const maxFiles = Math.max(...filesCount.current);
                    const maxIndex = filesCount.current.indexOf(maxFiles); // WHAT IF WE HAVE SAME MAX FILES, WE WILL JUST PICK FIRST ONE
                    setUserPreferences((prev) => ({ ...prev, defaultStorageDirectory: directories[maxIndex] }));
                }
                // Refresh the list of directories
                initialize();
            } catch (error) {
                console.error('Error deleting directory:', error);
            }
        }
    }

    // TODO fix later
    const handleBackupDir = async (dir) => {
        const appSaveDir = getAppSavePath(dir);
        // // get number of files
        const files = await FileSystem.readDirectoryAsync(appSaveDir);
        const fileCount = files.length;
        if (fileCount === 0) {
            Alert.alert("Backup Directory", "No files to backup in this directory", [{ text: "OK" }]);
            return;
        }


        const zip = new JSZip();
        const myZip = zip.folder(dir);
        files.forEach(async (file) => {
            const filePath = appSaveDir + '/' + file;
            const fileContent = await FileSystem.readAsStringAsync(filePath);
            myZip?.file(file, fileContent);
        })
        myZip?.generateAsync({ type: "base64" })
            .then(function (content) {
                const fileUri = `${FileSystem.documentDirectory}/${dir}.zip`;
                FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.Base64 });

                Sharing.shareAsync(fileUri);
            });


        // return;
        // // create a zip file in cache directory of all files
        // const targetPath = getAppSavePath('mypath.zip')  // FileSystem.cacheDirectory + 'mypath.zip';
        // // const sourcePath = appSaveDir
        // console.log('appsavedir', appSaveDir);
        // console.log(targetPath);
        // // console.log(sourcePath);
        // zip(appSaveDir, targetPath)
        //     .then((path) => {
        //         console.log(`zip completed at ${path}`)
        //         Sharing.shareAsync(path);
        //         // let it download using expo sharing
    };

    const hrFormat = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))), 10);
        return `${Math.round(bytes / Math.pow(1024, i), 2)} ${sizes[i]}`;
    }

    return (loading
        ? <ActivityIndicator size="small" color="#0000ff" />
        : (
        <View style={{ marginHorizontal: 15 }}>
            <Text>Root: {rootDirPath.current.replace('file://', '')} </Text>

            {
                userPreferences.defaultStorageDirectory
                    ? <Text>Current directory: {userPreferences.defaultStorageDirectory} </Text>
                    : <Text style={{ color: 'red' }}>Error:: select a working directory.</Text>
            }
            <Text>
                Total Sketches: {filesCount.current[directories.current.indexOf(userPreferences.defaultStorageDirectory)]}
            </Text>
            <Text>
                Total Images: {imagesCount.current[(directories.current.indexOf(userPreferences.defaultStorageDirectory))]}
            </Text>
            <Text>Total size: {hrFormat(filesSize.current[(directories.current.indexOf(userPreferences.defaultStorageDirectory))])}
            </Text>
            <Text>
                Total free space: {hrFormat(freeSpace.current)} out of {hrFormat(totalSpace.current)}.</Text>
            <Divider width={SCREEN_WIDTH - 50} height={2} color={MY_BLACK} />
            <Text>Select current storage directory or create new one.</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.75, width: '80%', marginVertical: 15 }}>
                <Text>mypath.</Text>
                <TextInput
                    value={newDirName}
                    onChangeText={(text) => setNewDirName(text)}
                    placeholder="Enter new directory name"
                    enablesReturnKeyAutomatically={true}
                    onSubmitEditing={handleNewDirSubmit}

                />
            </View>
            <ScrollView
            contentContainerStyle={{ paddingVertical: 10}}
                nestedScrollEnabled={true}
                style={{
                    height: 250, backgroundColor: '#F0F0F0'
                }}>
                {directories.current.map((dirName, index) => (
                    <View key={dirName}>
                        <View style={{
                            backgroundColor: dirName === userPreferences.defaultStorageDirectory ? '#4E2DBA77' : undefined,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 5
                        }}>
                            <Text style={{ padding: 10, fontWeight: '700', }}>
                                [{filesCount.current[index]}] {dirName}
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => handleDirectoryChange(dirName)}>
                                    <MyIcon size={24} name='checkbox-checked' fill='#000000' color='#00000033' strokeWidth={0.75} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleBackupDir(dirName)}>
                                <MyIcon size={20} name='export' color='#000000' style={{ marginLeft: 15 }} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteDir(dirName)}>
                                <MyIcon size={22} name='trash' color='#000000' style={{ marginLeft: 15 }} />
                                </TouchableOpacity>

                            </View>
                        </View>
                        <Divider width={'100%'} color={'#CFCFCF'} height={1.5} />
                    </View>
                ))}
            </ScrollView>
        </View>
    ));
};

export default StoragePreference;