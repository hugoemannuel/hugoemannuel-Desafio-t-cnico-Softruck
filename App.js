import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Data from "./data/frontend_data_gps.json";
import { useEffect, useState } from "react";

export default function App() {
  const { courses, vehicle } = Data;

  const [spritePositionIndex, setSpritePositionIndex] = useState(0);

  const [spritePosition, setSpritePosition] = useState({
    latitude: courses[0].gps[0].latitude,
    longitude: courses[0].gps[0].longitude,
  });

  const handleUpdateCord = () => {
    const nextIndex = spritePositionIndex + 1;
    if (nextIndex < courses[0].gps.length) {
      const nextCoordinates = courses[0].gps[nextIndex];
      setSpritePositionIndex(nextIndex);
      setSpritePosition({
        latitude: nextCoordinates.latitude,
        longitude: nextCoordinates.longitude,
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleUpdateCord();
    }, 1500);

    return () => clearInterval(interval);
  }, [spritePosition]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: spritePosition.latitude,
          longitude: spritePosition.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
      >
        <Marker
          icon={{ uri: vehicle.picture.address}}
          coordinate={{
            latitude: spritePosition.latitude,
            longitude: spritePosition.longitude,
          }}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    flex: 1,
    width: "100%",
  },
});
