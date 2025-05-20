import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Modal, TextInput, Image, ActivityIndicator, FlatList } from 'react-native';

// Mapeamento de nomes especiais de países
const SPECIAL_COUNTRY_NAMES: { [key: string]: string } = {
  'US': 'Estados Unidos',
  'GB': 'Reino Unido',
  'NZ': 'Nova Zelândia',
};

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
  const [error, setError] = useState<string | null>(null);

  const loadAllCountries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://restcountries.com/v3.1/all`);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados dos países');
      }
      const data: CountryApiResponse[] = await response.json();

      const formatted = data
        .filter((country) => country.currencies && country.cca2)
        .map((country) => {
          const currencyCode = Object.keys(country.currencies)[0];
          const currencyInfo = country.currencies[currencyCode];

          let countryName = country.translations?.por?.common || country.name.common;
          
          // Usa o mapeamento de nomes especiais
          countryName = SPECIAL_COUNTRY_NAMES[country.cca2] || countryName;

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
      setError('Não foi possível carregar a lista de países. Por favor, tente novamente.');
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
          setError(null);
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
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={loadAllCountries}
                  >
                    <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                  </TouchableOpacity>
                </View>
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
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#2D2A36',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  flag: {
    borderRadius: 4,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  countryCode: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  separator: {
    height: 1,
    backgroundColor: '#2D2A36',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8AB4F8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
}); 