import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";

const FooterMap = ({
  start,
  setStart,
  realSpeed,
  dataSelected,
  selected,
  handleChangeSelected,
  estimatedTime,
  handleReset,
  averageSpeed,
  spritePositionIndex,
  courses,
}) => {
  return (
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
  );
};

export default FooterMap;

const styles = StyleSheet.create({
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
