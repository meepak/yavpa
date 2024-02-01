import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const YavpaStyled = () => {
    const text = "Yet Another Vector Path Animator";
    return (
        <View style={styles.container}>
            {text.split(' ').map((word, index) => (
                <View key={index} style={styles.wordContainer}>
                    {word.split('').map((char, index) => (
                        <Text key={index} style={char === char.toUpperCase() ? styles.uppercase : styles.lowercase}>
                            {char}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flexWrap: 'wrap',
        opacity: 0.2,
    },
    wordContainer: {
        flexDirection: 'column',
    },
    uppercase: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 32,
    },
    lowercase: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default YavpaStyled;