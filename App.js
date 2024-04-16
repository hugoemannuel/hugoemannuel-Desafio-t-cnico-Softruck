import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Data from "./data/frontend_data_gps.json";
import RNPickerSelect from "react-native-picker-select";
import { useEffect, useMemo, useRef, useState } from "react";

export default function App() {
  const { courses, vehicle } = Data;
  const mapRef = useRef(MapView);
  const [start, setStart] = useState(false);
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [realSpeed, setRealSpeed] = useState(0);
  const [spritePositionIndex, setSpritePositionIndex] = useState(0);
  const [selected, setSelected] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState({
    hours: 0,
    minutes: 0,
  });

  const [spritePosition, setSpritePosition] = useState({
    latitude: courses[0].gps[0].latitude,
    longitude: courses[0].gps[0].longitude,
  });

  const calculateAverageSpeed = (selectedCourse) => {
    let totalDistance = 0;
    let totalTime = 0;

    const course = courses[selectedCourse];
    const gps = course.gps;
    const courseDistance = course.distance;
    const courseTime =
      gps[gps.length - 1].acquisition_time_unix - gps[0].acquisition_time_unix;

    totalDistance += courseDistance;
    totalTime += courseTime;

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
    if (nextIndex < courses[selected].gps.length) {
      const nextCoordinates = courses[selected].gps[nextIndex];
      setSpritePositionIndex(nextIndex);
      setSpritePosition({
        latitude: nextCoordinates.latitude,
        longitude: nextCoordinates.longitude,
      });

      setRealSpeed(nextCoordinates.speed.toFixed(1));

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
        latitude: courses[selected].gps[0].latitude,
        longitude: courses[selected].gps[0].longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      },
      1500
    );

    setSpritePosition({
      latitude: courses[selected].gps[0].latitude,
      longitude: courses[selected].gps[0].longitude,
    });
    setStart(false);
    setSpritePositionIndex(0);
  };

  const handleChangeSelected = (index) => {
    if (typeof index !== "undefined") {
      mapRef?.current.animateToRegion(
        {
          latitude: courses[index].gps[0].latitude,
          longitude: courses[index].gps[0].longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        },
        1500
      );
      setSpritePosition({
        latitude: courses[index].gps[0].latitude,
        longitude: courses[index].gps[0].longitude,
      });
      setSelected(index);
      setSpritePositionIndex(0);
    }
  };

  useEffect(() => {
    if (start) {
      const interval = setInterval(() => {
        handleUpdateCord();
      }, 1500);

      if (spritePositionIndex === courses[selected]?.gps.length - 1) {
        clearInterval(interval);
      }

      return () => clearInterval(interval);
    }
  }, [spritePositionIndex, start, selected]);

  const dataSelected = useMemo(() => {
    return courses.map((_course, i) => ({
      label: `rota-${i}`,
      value: i,
    }));
  }, [courses]);

  useEffect(() => {
    const { averageSpeed, estimatedTime } = calculateAverageSpeed(selected);
    setAverageSpeed(averageSpeed.toFixed(1));
    setEstimatedTime(estimatedTime);
  }, [courses, selected]);

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
        {start ? (
          <View>
            <Text style={styles.overlayText}>Velocidade: {realSpeed} km/h</Text>
          </View>
        ) : (
          <View>
            <RNPickerSelect
              placeholder={{
                label: "Selecione uma rota",
                value: undefined,
                color: "#9EA0A4",
              }}
              onValueChange={(value) => handleChangeSelected(value)}
              items={dataSelected}
              value={selected}
            />

            <Text style={styles.overlayText}>
              Tempo Médio:
              {` ${estimatedTime.hours} horas : ${estimatedTime.minutes} minutos`}
            </Text>
            <Text style={styles.overlayText}>
              Velocidade Média do trajeto: {averageSpeed} km/h
            </Text>
          </View>
        )}
        {spritePositionIndex === courses[selected]?.gps.length - 1 ? (
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
  containerSelected: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
