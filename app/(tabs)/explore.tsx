import React from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Text, Modal, TextInput, Image, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useState } from 'react';

interface Country {
  name: string;
  code: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
}

interface CountryApiResponse {
  name: {
    common: string;
    nativeName: {
      por?: {
        common: string;
      }
    };
  };
  translations: {
    por: {
      common: string;
    };
  };
  cca2: string;
  currencies: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
}

const getFlagUrl = (countryCode: string) => {
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

const FlagWithFallback = ({ countryCode, size = 40 }: { 
  countryCode: string; 
  size?: number 
}) => {
  const [error, setError] = useState(false);

  if (error || !countryCode) {
    return (
      <View style={[styles.flag, { 
        width: size, 
        height: size * 0.75, 
        backgroundColor: '#ccc', 
        justifyContent: 'center', 
        alignItems: 'center',
      }]}>
        <Text style={{ fontSize: size * 0.3, color: '#333' }}>{countryCode}</Text>
      </View>
    );
  }

  return (
    <Image 
      source={{ 
        uri: getFlagUrl(countryCode),
        cache: 'force-cache',
      }}
      style={[styles.flag, { 
        width: size, 
        height: size * 0.75,
        resizeMode: 'cover',
      }]}
      onError={() => setError(true)}
    />
  );
};

type SelectedItem = {
  currency: string;
  amount: string;
  equivalent?: string;
  countryCode?: string;
  countryName?: string;
};

export default function SelectedItemsScreen() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([
    { currency: 'AOA', amount: '10.000.000,00', equivalent: '(US)', countryCode: 'AO', countryName: 'Angola' },
    { currency: 'BRL', amount: '10.000.000,00', equivalent: '(US)', countryCode: 'BR', countryName: 'Brasil' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchCountries = async (text: string) => {
    if (text.length < 2) {
      setCountries([]);
      return;
    }

    setIsLoading(true);
    try {
      const [nameResponse, currencyResponse] = await Promise.all([
        fetch('https://restcountries.com/v3.1/name/' + text),
        fetch('https://restcountries.com/v3.1/currency/' + text)
      ]);

      let nameData = [];
      let currencyData = [];

      if (nameResponse.ok) {
        nameData = await nameResponse.json();
      }
      if (currencyResponse.ok) {
        currencyData = await currencyResponse.json();
      }

      const combinedData = [...nameData, ...currencyData];
      const uniqueData = Array.from(new Set(combinedData.map(country => country.cca2)))
        .map(code => combinedData.find(country => country.cca2 === code))
        .filter(country => country && country.currencies); 

      const formattedCountries = uniqueData
        .map((country) => {
          const currencyCode = Object.keys(country.currencies)[0];
          const currencyInfo = country.currencies[currencyCode];
          
          return {
            name: country.translations.por?.common || country.name.common,
            code: country.cca2,
            currency: {
              code: currencyCode,
              name: currencyInfo.name,
              symbol: currencyInfo.symbol
            }
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

      setCountries(formattedCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      setCountries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCountries = searchText
    ? countries.filter(country =>
        country.name.toLowerCase().includes(searchText.toLowerCase()) ||
        country.code.toLowerCase().includes(searchText.toLowerCase()) ||
        country.currency.code.toLowerCase().includes(searchText.toLowerCase()) ||
        country.currency.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : countries;

  const handleSelectCountry = (country: Country) => {
    const newItem: SelectedItem = {
      currency: country.currency.code,
      amount: '0,00',
      equivalent: '(US)',
      countryCode: country.code,
      countryName: country.name
    };
    setSelectedItems([...selectedItems, newItem]);
    setModalVisible(false);
    setSearchText('');
  };

  const renderItem = ({ item }: { item: SelectedItem }) => (
    <ThemedView style={styles.itemContainer}>
      {item.countryCode && (
        <View style={styles.flagContainer}>
          <FlagWithFallback countryCode={item.countryCode} size={30} />
        </View>
      )}
      <TextInput
        value={item.currency}
        style={styles.input}
        editable={false}
      />
      <View style={styles.amountContainer}>
        <TextInput
          value={item.amount}
          style={styles.input}
          editable={true}
        />
        {item.equivalent && (
          <TextInput
            value={item.equivalent}
            style={[styles.input, styles.equivalentInput]}
            editable={true}
          />
        )}
      </View>
    </ThemedView>
  );

  return (
    <>
      <ParallaxScrollView noHeader>
        <ThemedView style={{ flex: 1, backgroundColor: '#101218' }}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Moedas Selecionadas</ThemedText>
          </ThemedView>

          <ThemedView style={styles.listContainer}>
            <FlatList
              data={selectedItems}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
            />
          </ThemedView>
        </ThemedView>
      </ParallaxScrollView>

      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.plusSign}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSearchText('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selecione um país</Text>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar país..."
                placeholderTextColor="#A0A0A0"
                value={searchText}
                onChangeText={(text) => {
                  setSearchText(text);
                  searchCountries(text);
                }}
                autoFocus={true}
              />
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color="#FFFFFF" style={styles.loadingIndicator} />
            ) : (
              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.code}
                style={styles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.countryItem}
                    onPress={() => handleSelectCountry(item)}
                  >
                    <FlagWithFallback countryCode={item.code} size={40} />
                    <View style={styles.countryInfo}>
                      <Text style={styles.countryName}>{item.name}</Text>
                      <Text style={styles.countryCode}>{item.code} - {item.currency.code}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    paddingTop: 20,
  },
  listContainer: {
    width: '100%',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  flagContainer: {
    marginRight: 10,
  },
  currencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  equivalentText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#ffffff',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 16,
    color: '#000000',
    marginVertical: 4,
    minWidth: 80,
  },
  equivalentInput: {
    fontSize: 14,
    color: '#666666',
  },
  floatingButton: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#8AB4F8',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 30,
    right: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    borderWidth: 0,
  },
  plusSign: {
    fontSize: 44,
    color: 'black',
    fontWeight: '300',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 44,
    transform: [{ translateY: -3 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1D1926',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#2E2A3A',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#FFFFFF',
  },
  searchContainer: {
    width: '100%',
    marginBottom: 15,
  },
  searchInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#2E2A3A',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#2A2438',
  },
  list: {
    width: '100%',
    marginBottom: 15,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 10,
  },
  flag: {
    borderRadius: 4,
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  countryCode: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  separator: {
    height: 1,
    backgroundColor: '#2E2A3A',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
});