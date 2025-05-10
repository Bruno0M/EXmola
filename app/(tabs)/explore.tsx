import React from 'react';
import { StyleSheet, TouchableOpacity, Text, Modal, View, TextInput, FlatList, Image, ActivityIndicator } from 'react-native';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
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

export default function TabTwoScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
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
    setSelectedCountry(country);
    setModalVisible(false);
    setSearchText('');
  };

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="chevron.left.forwardslash.chevron.right"
            style={styles.headerImage}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Explore</ThemedText>
          {selectedCountry && (
            <View style={styles.selectedCountryContainer}>
              <FlagWithFallback countryCode={selectedCountry.code} size={40} />
              <View style={styles.selectedCountryInfo}>
                <Text style={styles.selectedCountryText}>
                  {selectedCountry.name}
                </Text>
                <Text style={styles.selectedCurrencyText}>
                  {selectedCountry.currency.code} • {selectedCountry.currency.symbol}
                </Text>
              </View>
            </View>
          )}
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
    flexDirection: 'column',
    gap: 8,
    paddingVertical: 16,
  },
  headerImage: {
    width: 310,
    height: 310,
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
  selectedCountryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#2A2438',
    borderRadius: 8,
  },
  selectedCountryInfo: {
    flex: 1,
    marginLeft: 10,
  },
  selectedCountryText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  selectedCurrencyText: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
});
