import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Data from "./data/frontend_data_gps.json";
import { useEffect, useMemo, useRef, useState } from "react";
import FooterMap from "./components/FooterMap";

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
      key: `route-selected-${i}`,
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
      <FooterMap
        dataSelected={dataSelected}
        estimatedTime={estimatedTime}
        handleChangeSelected={handleChangeSelected}
        handleReset={handleReset}
        realSpeed={realSpeed}
        selected={selected}
        setStart={setStart}
        averageSpeed={averageSpeed}
        start={start}
        courses={courses}
        spritePositionIndex={spritePositionIndex}
      />
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
