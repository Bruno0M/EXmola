import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Entypo';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis } from 'victory';


type Currency = {
  code: string;
  name: string;
};

type ChartPoint = {
  x: string;
  y: number;
};

export default function HomeScreen() {
  const [valor, setValor] = useState('');
  const [resultado, setResultado] = useState('');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency1, setSelectedCurrency1] = useState<string>('USD');
  const [selectedCurrency2, setSelectedCurrency2] = useState<string>('BRL');
  const [loading, setLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  function getFlagUrl(currencyCode: string): string {
    const countryCode = currencyCode.slice(0, 2).toUpperCase();
    return `https://flagsapi.com/${countryCode}/flat/64.png`;
  }

  function swapCurrencies() {
    setSelectedCurrency1(selectedCurrency2);
    setSelectedCurrency2(selectedCurrency1);
  }

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('https://economia.awesomeapi.com.br/json/available/uniq');
        const data = await response.json();

        const currenciesArray: Currency[] = Object.keys(data).map((key) => ({
          code: key,
          name: data[key],
        }));

        setCurrencies(currenciesArray);
      } catch (error) {
        console.error('Erro ao buscar moedas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  useEffect(() => {
    const calcularConversao = async () => {
      if (!valor) {
        setResultado('');
        return;
      }
      try {
        const url = `https://economia.awesomeapi.com.br/last/${selectedCurrency1}-${selectedCurrency2}`;
        const resposta = await fetch(url);
        const dados = await resposta.json();
        const par = selectedCurrency1 + selectedCurrency2;
        const taxa = parseFloat(dados[par].bid);
        const valorConvertido = parseFloat(valor) * taxa;
        setResultado(valorConvertido.toFixed(2));
      } catch (erro) {
        console.log(erro);
        setResultado('Erro');
      }
    };

    calcularConversao();
  }, [valor, selectedCurrency1, selectedCurrency2]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const url = `https://economia.awesomeapi.com.br/json/daily/${selectedCurrency1}-${selectedCurrency2}/30`;
        const response = await fetch(url);
        const data = await response.json();

        const parsedData = data.reverse().map((item: any) => ({
          x: new Date(item.timestamp * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          y: parseFloat(item.bid)
        }));

        setChartData(parsedData);
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
      }
    };

    fetchChartData();
  }, [selectedCurrency1, selectedCurrency2]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Carregando moedas...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.seletor}>
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            keyboardType='numeric'
            placeholder='0.00'
            value={valor}
            onChangeText={setValor}
          />
          <Image
            source={{ uri: getFlagUrl(selectedCurrency1) }}
            style={styles.flag}
          />
          <Picker
            style={styles.picker}
            selectedValue={selectedCurrency1}
            onValueChange={(itemValue) => setSelectedCurrency1(itemValue)}
          >
            {currencies.map((currency) => (
              <Picker.Item
                key={currency.code}
                label={`${currency.code} - ${currency.name}`}
                value={currency.code}
              />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.iconArea} onPress={swapCurrencies}>
          <Icon name="swap" size={28} color="#fff" style={{ transform: [{ rotate: '90deg' }] }} />
        </TouchableOpacity>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            keyboardType='numeric'
            placeholder='0.00'
            value={resultado}
            editable={false}
          />
          <Image
            source={{ uri: getFlagUrl(selectedCurrency2) }}
            style={styles.flag}
          />
          <Picker
            style={styles.picker}
            selectedValue={selectedCurrency2}
            onValueChange={(itemValue) => setSelectedCurrency2(itemValue)}
          >
            {currencies.map((currency) => (
              <Picker.Item
                key={currency.code}
                label={`${currency.code} - ${currency.name}`}
                value={currency.code}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Histórico (30 dias)</Text>
        <VictoryChart
  theme={VictoryTheme.material}
  domainPadding={15}
  style={{
    parent: {
      background: '', // cor de fundo mais escura opcional
    },
  }}
>
  <VictoryAxis
    fixLabelOverlap
    tickFormat={(t: any) => `${t}`}
    style={{
      axis: { stroke: '#ccc' },
      tickLabels: { fontSize: 10, fill: '#ccc' },
      grid: { stroke: 'none' }, // remove linhas verticais
    }}
  />
  <VictoryAxis
    dependentAxis
    tickFormat={(t: number) => `R$${t.toFixed(2)}`}
    style={{
      axis: { stroke: '#ccc' },
      tickLabels: { fontSize: 10, fill: '#ccc' },
      grid: { stroke: 'none' }, // remove linhas horizontais
    }}
  />
  <VictoryLine
    data={chartData}
    interpolation="monotoneX"
    style={{
      data: {
        stroke: '#3a86ff',
        strokeWidth: 2,
      },
    }}
  />
</VictoryChart>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#171921',
    alignItems: 'center',
    paddingTop: '15%',
    paddingBottom: 30
  },
  seletor: {
    borderRadius: 5,
    marginBottom: 15
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: 380,
    height: 60,
    fontFamily: 'Inter',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10
  },
  flag: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 60,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  picker: {
    width: 50,
    height: 50,
    borderColor: 'transparent',
    fontSize: 12,
    fontWeight: '400',
    backgroundColor: 'transparent'
  },
  iconArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chartContainer: {
    width: '95%',
    borderRadius: 10,
    padding: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff'
  }
});
