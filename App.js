import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Data from "./data/frontend_data_gps.json";
import { useEffect, useRef, useState } from "react";

export default function App() {
  const { courses, vehicle } = Data;
  const mapRef = useRef(MapView);
  const [start, setStart] = useState(false);
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [spritePositionIndex, setSpritePositionIndex] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState({
    hours: 0,
    minutes: 0,
  });

  const [spritePosition, setSpritePosition] = useState({
    latitude: courses[0].gps[0].latitude,
    longitude: courses[0].gps[0].longitude,
  });

  const calculateAverageSpeed = () => {
    let totalDistance = 0;
    let totalTime = 0;

    courses.forEach((course) => {
      const gps = course.gps;
      const courseDistance = course.distance;
      const courseTime =
        gps[gps.length - 1].acquisition_time_unix -
        gps[0].acquisition_time_unix;

      totalDistance += courseDistance;
      totalTime += courseTime;
    });

    const averageSpeed = (totalDistance / totalTime) * 3.6;
    const estimatedHours = Math.floor(totalTime / 3600);
    const estimatedMinutes = Math.floor((totalTime % 3600) / 60);

    return {
      averageSpeed,
      estimatedTime: { hours: estimatedHours, minutes: estimatedMinutes },
    };
  };
  const handleUpdateCord = () => {
    const nextIndex = spritePositionIndex + 1;
    if (nextIndex < courses[0].gps.length) {
      const nextCoordinates = courses[0].gps[nextIndex];
      setSpritePositionIndex(nextIndex);
      setSpritePosition({
        latitude: nextCoordinates.latitude,
        longitude: nextCoordinates.longitude,
      });
      mapRef?.current.animateToRegion(
        {
          latitude: nextCoordinates.latitude,
          longitude: nextCoordinates.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        },
        1500
      );
    }
  };

  const handleReset = () => {
    mapRef?.current.animateToRegion(
      {
        latitude: courses[0].gps[0].latitude,
        longitude: courses[0].gps[0].longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      },
      1500
    );
    setSpritePosition({
      latitude: courses[0].gps[0].latitude,
      longitude: courses[0].gps[0].longitude,
    });
    setSpritePosition({
      latitude: courses[0].gps[0].latitude,
      longitude: courses[0].gps[0].longitude,
    });
    setStart(false);
    setSpritePositionIndex(0);
  };

  useEffect(() => {
    if (start) {
      const interval = setInterval(() => {
        handleUpdateCord();
      }, 1500);

      if (spritePositionIndex === courses[0]?.gps.length - 1) {
        clearInterval(interval);
      }

      return () => clearInterval(interval);
    }
  }, [spritePositionIndex, start]);

  useEffect(() => {
    const { averageSpeed, estimatedTime } = calculateAverageSpeed();
    setAverageSpeed(averageSpeed.toFixed(2));
    setEstimatedTime(estimatedTime);
  }, [courses]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: spritePosition.latitude,
          longitude: spritePosition.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
      >
        <Marker
          icon={{ uri: vehicle.picture.address }}
          coordinate={{
            latitude: spritePosition.latitude,
            longitude: spritePosition.longitude,
          }}
        />
      </MapView>
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>
          Tempo Médio:
          {` ${estimatedTime.hours} horas : ${estimatedTime.minutes} minutos`}
        </Text>
        <Text style={styles.overlayText}>
          Velocidade Média do trajeto: {averageSpeed} km/h
        </Text>
        {spritePositionIndex === courses[0]?.gps.length - 1 ? (
          <TouchableOpacity style={styles.startButton} onPress={handleReset}>
            <Text style={styles.startButtonText}>Recomeçar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setStart(!start)}
          >
            <Text style={styles.startButtonText}>
              {!start ? "Iniciar" : "Parar"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
  overlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  overlayText: {
    fontSize: 16,
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
  },
});
