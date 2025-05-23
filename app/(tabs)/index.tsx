import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/Entypo';
import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryAxis
} from 'victory-native';

type Currency = {
  code: string;
  name: string;
  symbol?: string;
};

type ChartPoint = {
  x: string;
  y: number;
};

export default function HomeScreen() {
  const [valor, setValor] = useState('');
  const [resultado, setResultado] = useState('');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency1, setSelectedCurrency1] = useState('USD');
  const [selectedCurrency2, setSelectedCurrency2] = useState('BRL');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [quotations, setQuotations] = useState<any[]>([]);

  function getFlagUrl(code: string) {
    return `https://flagsapi.com/${code.slice(0, 2).toUpperCase()}/flat/64.png`;
  }

  function swap() {
    setSelectedCurrency1(selectedCurrency2);
    setSelectedCurrency2(selectedCurrency1);
  }

  useEffect(() => {
    (async () => {
      try {
        const r1 = await fetch('https://economia.awesomeapi.com.br/json/available/uniq');
        const d1 = await r1.json();
        const r2 = await fetch('https://api.exchangerate.host/symbols');
        const d2 = await r2.json();

        setCurrencies(
          Object.keys(d1).map(key => ({
            code: key,
            name: d1[key],
            symbol: d2.symbols?.[key]?.symbol || key
          }))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!valor) {
      setResultado('');
      return;
    }

    (async () => {
      try {
        const resp = await fetch(
          `https://economia.awesomeapi.com.br/last/${selectedCurrency1}-${selectedCurrency2}`
        );
        const js = await resp.json();
        const t = parseFloat(js[selectedCurrency1 + selectedCurrency2].bid);
        setResultado((parseFloat(valor) * t).toFixed(2));
      } catch {
        setResultado('Erro');
      }
    })();
  }, [valor, selectedCurrency1, selectedCurrency2]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `https://economia.awesomeapi.com.br/json/daily/${selectedCurrency1}-${selectedCurrency2}/30`
        );
        const js = await resp.json();
        setChartData(
          js
            .reverse()
            .map((i: any) => ({
              x: new Date(i.timestamp * 1000).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit'
              }),
              y: parseFloat(i.bid)
            }))
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedCurrency1, selectedCurrency2]);

  useEffect(() => {
    // Simula carregamento de cotações locais (mock)
    const mockQuotations = [
      {
        id: 0,
        currency: 'USD',
        latest_date: '2023-10-01',
        previous_date: '2023-09-30',
        latest_value: 1.0,
        previous_value: 0.95
      },
      {
        id: 1,
        currency: 'EUR',
        latest_date: '2023-10-01',
        previous_date: '2023-09-30',
        latest_value: 0.85,
        previous_value: 0.80
      },
      {
        id: 2,
        currency: 'GBP',
        latest_date: '2023-10-01',
        previous_date: '2023-09-30',
        latest_value: 0.75,
        previous_value: 0.70
      }
    ];
    setQuotations(mockQuotations);
  }, []);

  const getSymbol = (code: string) => {
    const symbol = currencies.find(c => c.code === code)?.symbol;
    if (!symbol || symbol.toUpperCase() === code.toUpperCase() || /^[A-Za-z]+$/.test(symbol)) {
      return code;
    }
    return symbol;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 10 }}>
          Carregando moedas...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} nestedScrollEnabled>
      <View style={styles.seletor}>
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="0.00"
            value={valor}
            onChangeText={setValor}
          />
          <DropDownPicker
            items={currencies.map(currency => ({
              label: currency.code,
              value: currency.code,
              icon: () => (
                <View style={styles.dropdownItem}>
                  <Image
                    source={{ uri: getFlagUrl(currency.code) }}
                    style={styles.flag}
                  />
                  <Text>{currency.symbol || currency.code}</Text>
                </View>
              )
            }))}
            open={open1}
            setOpen={setOpen1}
            value={selectedCurrency1}
            setValue={setSelectedCurrency1 as any}
            containerStyle={[styles.dropdown, { zIndex: open1 ? 3000 : 1 }]}
            dropDownContainerStyle={[styles.dropdownContainer, { zIndex: 3000 }]}
            multiple={false}
            listMode="MODAL"
            modalProps={{ animationType: 'slide', transparent: true }}
            modalContentContainerStyle={{
              backgroundColor: '#dee2e6',
              borderRadius: 16,
              padding: 20,
              width: '80%',
              alignSelf: 'center',
              marginTop: '50%',
              maxHeight: '50%'
            }}
            listItemLabelStyle={{ opacity: 0, width: 0 }}
            labelStyle={{ opacity: 0, width: 0 }}
            searchable
            searchPlaceholder="Pesquisar (p.ex. USD)"
            searchContainerStyle={{ marginBottom: 10 }}
          />
        </View>

        <TouchableOpacity style={styles.iconArea} onPress={swap}>
          <Icon
            name="swap"
            size={28}
            color="#fff"
            style={{ transform: [{ rotate: '90deg' }] }}
          />
        </TouchableOpacity>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="0.00"
            value={resultado}
            editable={false}
          />
          <DropDownPicker
            items={currencies.map(currency => ({
              label: currency.code,
              value: currency.code,
              icon: () => (
                <View style={styles.dropdownItem}>
                  <Image
                    source={{ uri: getFlagUrl(currency.code) }}
                    style={styles.flag}
                  />
                  <Text>{currency.symbol || currency.code}</Text>
                </View>
              )
            }))}
            open={open2}
            setOpen={setOpen2}
            value={selectedCurrency2}
            setValue={setSelectedCurrency2 as any}
            containerStyle={[styles.dropdown, { zIndex: open2 ? 3000 : 1 }]}
            dropDownContainerStyle={[styles.dropdownContainer, { zIndex: 3000 }]}
            multiple={false}
            listMode="MODAL"
            modalProps={{ animationType: 'slide', transparent: true }}
            modalContentContainerStyle={{
              backgroundColor: '#dee2e6',
              borderRadius: 16,
              padding: 20,
              width: '80%',
              alignSelf: 'center',
              marginTop: '50%',
              maxHeight: '50%'
            }}
            listItemLabelStyle={{ opacity: 0, width: 0 }}
            labelStyle={{ opacity: 0, width: 0 }}
            searchable
            searchPlaceholder="Pesquisar (p.ex. BRL)"
            searchContainerStyle={{ marginBottom: 10 }}
          />
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Histórico (30 dias)</Text>
        <VictoryChart theme={VictoryTheme.material} domainPadding={15}>
          <VictoryAxis
            fixLabelOverlap
            tickFormat={(t: any) => `${t}`}
            style={{
              axis: { stroke: '#ccc' },
              tickLabels: { fontSize: 10, fill: '#ccc' },
              grid: { stroke: 'none' }
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t: number) => `${getSymbol(selectedCurrency2)} ${t.toFixed(2)}`}
            style={{
              axis: { stroke: '#ccc' },
              tickLabels: { fontSize: 6, fill: '#ccc' },
              grid: { stroke: 'none' }
            }}
          />
          <VictoryLine
            data={chartData}
            interpolation="monotoneX"
            style={{ data: { stroke: '#3a86ff', strokeWidth: 2 } }}
          />
        </VictoryChart>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={styles.chartTitle}>Cotações Locais (Mock)</Text>
        {quotations.map((quotation) => (
          <Text key={quotation.id} style={{ color: '#fff', marginBottom: 4 }}>
            {`${quotation.currency}: ${quotation.latest_value}`}
          </Text>
        ))}
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
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10
  },
  flag: {
    width: 32,
    height: 32,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  input: {
    flex: 1,
    height: 60,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 10
  },
  dropdown: {
    flex: 1
  },
  dropdownContainer: {
    width: 200
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconArea: {
    alignItems: 'center',
    marginBottom: 20
  },
  chartContainer: {
    width: '95%',
    borderRadius: 10,
    padding: 10
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff'
  }
});
