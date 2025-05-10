import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Modal, TextInput, Image, ActivityIndicator, FlatList } from 'react-native';

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

interface CountrySelectorProps {
  onSelectCountry: (country: Country) => void;
}

const getFlagUrl = (countryCode: string) => {
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

export const FlagWithFallback = ({ countryCode, size = 40 }: { 
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

export function CountrySelector({ onSelectCountry }: CountrySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadAllCountries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://restcountries.com/v3.1/all`);
      const data: CountryApiResponse[] = await response.json();

      const formatted = data
        .filter((country) => country.currencies && country.cca2)
        .map((country) => {
          const currencyCode = Object.keys(country.currencies)[0];
          const currencyInfo = country.currencies[currencyCode];

          let countryName = country.translations?.por?.common || country.name.common;

          if (country.cca2 === 'US') countryName = 'Estados Unidos';
          if (country.cca2 === 'GB') countryName = 'Reino Unido';
          if (country.cca2 === 'NZ') countryName = 'Nova Zelândia';

          return {
            name: countryName,
            code: country.cca2,
            currency: {
              code: currencyCode,
              name: currencyInfo.name,
              symbol: currencyInfo.symbol,
            },
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

      setAllCountries(formatted);
      setCountries(formatted);
    } catch (error) {
      console.error("Erro ao carregar países:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCountries = (text: string) => {
    setSearchText(text);
    if (!text) {
      setCountries(allCountries);
      return;
    }

    const filtered = allCountries.filter((country) =>
      country.name.toLowerCase().includes(text.toLowerCase()) ||
      country.code.toLowerCase().includes(text.toLowerCase()) ||
      country.currency.code.toLowerCase().includes(text.toLowerCase()) ||
      country.currency.name.toLowerCase().includes(text.toLowerCase())
    );

    setCountries(filtered);
  };

  const handleSelectCountry = (country: Country) => {
    onSelectCountry(country);
    setModalVisible(false);
    setSearchText('');
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => {
          setModalVisible(true);
          if (allCountries.length === 0) loadAllCountries();
        }}
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
                onChangeText={filterCountries}
                autoFocus={true}
              />
            </View>

            <View style={styles.listContainer}>
              {isLoading ? (
                <ActivityIndicator size="large" color="#FFFFFF" style={styles.loadingIndicator} />
              ) : (
                <FlatList
                  data={countries}
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
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
  listContainer: {
    width: '100%',
    flex: 1,
  },
  list: {
    width: '100%',
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
