import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Modal, TextInput, Image, ActivityIndicator, FlatList, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';

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
  isVisible: boolean;
  onClose: () => void;
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

export function CountrySelector({ 
  onSelectCountry, 
  isVisible, 
  onClose 
}: CountrySelectorProps) {
  const [modalVisible, setModalVisible] = useState(isVisible);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countriesLoaded, setCountriesLoaded] = useState(false);
  const [modalHeight, setModalHeight] = useState<'auto' | '80%'>('auto');

  useEffect(() => {
    if (isVisible) {
      setModalVisible(true);
      setCountries([]);
      setSearchText('');
      setError(null);
      setModalHeight('auto');
    } else {
      setModalVisible(false);
      setCountries([]);
      setSearchText('');
      setError(null);
    }
  }, [isVisible]);

  const loadAllCountries = async () => {
    if (countriesLoaded) return;
    
    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading countries...');
      const response = await fetch(`https://restcountries.com/v3.1/all`);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados dos países');
      }
      const data: CountryApiResponse[] = await response.json();
      console.log('Countries loaded:', data.length);

      const formatted = data
        .filter((country) => country.currencies && country.cca2)
        .map((country) => {
          const currencyCode = Object.keys(country.currencies)[0];
          const currencyInfo = country.currencies[currencyCode];

          let countryName = country.translations?.por?.common || country.name.common;
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

      console.log('Formatted countries:', formatted.length);
      setAllCountries(formatted);
      setCountriesLoaded(true);
    } catch (error) {
      console.error("Erro ao carregar países:", error);
      setError('Não foi possível carregar a lista de países. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCountries = async (text: string) => {
    console.log('Filtering with text:', text);
    setSearchText(text);
    
    if (!countriesLoaded) {
      await loadAllCountries();
    }

    if (!text.trim()) {
      console.log('Empty text, clearing countries');
      setCountries([]);
      setModalHeight('auto');
      return;
    }

    const searchTextLower = text.toLowerCase().trim();
    const filtered = allCountries.filter((country) =>
      country.name.toLowerCase().includes(searchTextLower) ||
      country.code.toLowerCase().includes(searchTextLower) ||
      country.currency.code.toLowerCase().includes(searchTextLower)
    );

    console.log('Filtered countries:', filtered.length);
    console.log('First few filtered countries:', filtered.slice(0, 3));
    setCountries(filtered);
    setModalHeight('80%');
  };

  const handleClose = () => {
    onClose();
    setCountries([]);
    setSearchText('');
    setError(null);
  };

  const handleSelectCountry = (country: Country) => {
    onSelectCountry(country);
    handleClose();
  };

  return (
    <Modal
      visible={modalVisible}
      onRequestClose={handleClose}
      animationType="fade"
      transparent={true}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContainer, { height: modalHeight }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecione um país</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Digite o nome do país..."
              placeholderTextColor="#A0A0A0"
              value={searchText}
              onChangeText={filterCountries}
              autoFocus={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {countries.length > 0 && (
            <View style={styles.listContainer}>
              <FlatList
                data={countries}
                keyExtractor={(item) => item.code}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.countryItem}
                    onPress={() => handleSelectCountry(item)}
                    activeOpacity={0.7}
                  >
                    <FlagWithFallback countryCode={item.code} size={36} />
                    <View style={styles.countryInfo}>
                      <Text style={styles.countryName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.countryCode}>{item.code} - {item.currency.code}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8AB4F8',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 100,
    right: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 0,
  },
  plusSign: {
    fontSize: 32,
    color: 'black',
    fontWeight: '300',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 32,
    transform: [{ translateY: -1 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1D1926',
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#1D1926',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2A36',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '300',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#1D1926',
  },
  searchInput: {
    backgroundColor: '#2D2A36',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#1D1926',
  },
  list: {
    flex: 1,
    backgroundColor: '#1D1926',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1D1926',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: '#1D1926',
  },
  flag: {
    borderRadius: 4,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
    marginRight: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1D1926',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1D1926',
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
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#1D1926',
  },
  emptyText: {
    color: '#A0A0A0',
    fontSize: 16,
  },
});