import { View, Text, StyleSheet } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>BILLIONAIRE BAY</Text>
      <Text style={styles.subtext}>SYSTEM ONLINE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0000FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  subtext: {
    color: 'yellow',
    fontSize: 20,
    marginTop: 20,
  }
});
