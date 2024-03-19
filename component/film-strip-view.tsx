import { FILM_STRIP_HOLE_HEIGHT, MY_BLACK, NUM_FILM_STRIP_HOLES } from "@u/types";
import { View, StyleSheet } from "react-native";


const FilmStripView = ({ children }) => (
  <View style={styles.container}>
    <View style={[styles.filmStrip, { left: 0 }]}>
      {Array(NUM_FILM_STRIP_HOLES).fill(0).map((_, i) => (
        <View
          key={i}
          style={[
            styles.hole,
            { backgroundColor: i % 2 === 0 ? MY_BLACK : 'transparent' },
            {borderRightWidth: 7, borderRightColor: MY_BLACK}
          ]}
        />
      ))}
    </View>

    {children}

    <View style={[styles.filmStrip, { right: 0 }]}>
      {Array(NUM_FILM_STRIP_HOLES).fill(0).map((_, i) => (
        <View
          key={i}
          style={[
            styles.hole,
            {
                backgroundColor: i % 2 === 0 ? MY_BLACK : 'transparent',
                borderLeftWidth: 7,
                borderLeftColor: MY_BLACK,
            },
          ]}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  filmStrip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  hole: {
    width: 14,
    height: FILM_STRIP_HOLE_HEIGHT,
  },
});

export default FilmStripView;
