import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Modal, TextInput, Image, FlatList, KeyboardAvoidingView, Platform } from 'react-native';

const SPECIAL_COUNTRY_NAMES: Record<string, string> = {
  'US': 'Estados Unidos',
  'GB': 'Reino Unido',
  'NZ': 'Nova Zelândia',
};

const MAIN_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'BRL', 'RUB', 'INR', 'MXN', 'SGD', 'NZD', 'HKD', 'TRY', 'SAR', 'SEK', 'NOK', 'DKK', 'PLN', 'ILS', 'THB', 'IDR', 'MYR', 'PHP', 'CLP', 'COP', 'ARS', 'PEN', 'UYU', 'PYG', 'BOB', 'VES', 'CRC', 'DOP', 'GTQ', 'HNL', 'NIO', 'PAB', 'SVC'];

interface Country {
  name: string;
  code: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
}

interface RestCountryResponse {
  name: {
    common: string;
    official: string;
  };
  currencies: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
  cca2: string;
}

interface CountrySelectorProps {
  onSelectCountry: (country: Country) => void;
  isVisible: boolean;
  onClose: () => void;
}

const getFlagUrl = (countryCode: string) => {
  const code = countryCode.slice(0, 2).toUpperCase();
  return `https://flagsapi.com/${code}/flat/64.png`;
};

export const FlagWithFallback = ({ countryCode, size = 40 }: { countryCode: string; size?: number }) => {
  const [error, setError] = useState(false);
  if (error || !countryCode) {
    return (
      <View style={[styles.flag, { width: size, height: size * 0.75, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: size * 0.3, color: '#333' }}>{countryCode}</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: getFlagUrl(countryCode) }}
      style={[styles.flag, { width: size, height: size * 0.75, resizeMode: 'cover' }]}
      onError={() => setError(true)}
    />
  );
};

export function CountrySelector({ onSelectCountry, isVisible, onClose }: CountrySelectorProps) {
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
      setSearchText('');
      setError(null);
      setModalHeight('auto');
      if (!countriesLoaded) {
        loadAllCountries();
      }
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
      console.log('Iniciando carregamento de países...');
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies,cca2');
      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar países: ${response.status} ${response.statusText}`);
      }
      
      const data: RestCountryResponse[] = await response.json();
      console.log('Número de países carregados:', data.length);

      const uniqueCountries = new Set<string>();
      const formatted = data
        .filter(country => {
          if (!country.currencies || Object.keys(country.currencies).length === 0) {
            console.log(`País sem moeda: ${country.name.common}`);
            return false;
          }
          const currencyCode = Object.keys(country.currencies)[0];
          const hasCurrency = MAIN_CURRENCIES.includes(currencyCode);
          if (!hasCurrency) {
            console.log(`Moeda não suportada: ${currencyCode} para ${country.name.common}`);
          }
          return hasCurrency;
        })
        .map(country => {
          const currencyCode = Object.keys(country.currencies)[0];
          const currency = country.currencies[currencyCode];
          const countryName = SPECIAL_COUNTRY_NAMES[country.cca2] || country.name.common;
          return {
            name: countryName,
            code: country.cca2,
            currency: {
              code: currencyCode,
              name: currency.name,
              symbol: currency.symbol,
            },
          };
        })
        .filter(country => {
          if (uniqueCountries.has(country.code)) {
            console.log(`País duplicado removido: ${country.name} (${country.code})`);
            return false;
          }
          uniqueCountries.add(country.code);
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

      console.log('Número de países após filtragem:', formatted.length);

      if (formatted.length === 0) {
        throw new Error('Nenhum país encontrado após filtragem');
      }

      setAllCountries(formatted);
      setCountries(formatted);
      setCountriesLoaded(true);
      setModalHeight('80%');
      console.log('Carregamento de países concluído com sucesso');
    } catch (error) {
      console.error('Erro detalhado:', error);
      setError(error instanceof Error ? error.message : 'Não foi possível carregar a lista de países');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCountries = (text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setCountries(allCountries);
      return;
    }
    const searchTextLower = text.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const filtered = allCountries.filter(country => {
      const countryName = country.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const countryCode = country.code.toLowerCase();
      const currencyCode = country.currency.code.toLowerCase();
      
      return countryName.includes(searchTextLower) ||
             countryCode.includes(searchTextLower) ||
             currencyCode.includes(searchTextLower);
    }).sort((a, b) => {
      // Prioriza os EUA quando buscar por USD
      if (searchTextLower === 'usd') {
        if (a.name === 'Estados Unidos') return -1;
        if (b.name === 'Estados Unidos') return 1;
      }
      
      // Prioriza correspondências exatas do código da moeda
      const aCurrencyExact = a.currency.code.toLowerCase() === searchTextLower;
      const bCurrencyExact = b.currency.code.toLowerCase() === searchTextLower;
      if (aCurrencyExact && !bCurrencyExact) return -1;
      if (!aCurrencyExact && bCurrencyExact) return 1;
      
      // Depois prioriza correspondências parciais do código da moeda
      const aCurrencyPartial = a.currency.code.toLowerCase().includes(searchTextLower);
      const bCurrencyPartial = b.currency.code.toLowerCase().includes(searchTextLower);
      if (aCurrencyPartial && !bCurrencyPartial) return -1;
      if (!aCurrencyPartial && bCurrencyPartial) return 1;
      
      // Por fim, ordena por nome
      return a.name.localeCompare(b.name, 'pt-BR');
    });
    setCountries(filtered);
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

  const renderItem = ({ item }: { item: Country }) => (
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
  );

  return (
    <Modal visible={modalVisible} onRequestClose={handleClose} animationType="slide" transparent={true}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.modalOverlay}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={[styles.modalContainer, { height: modalHeight }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecione um país</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
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
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
          <View style={styles.listContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando países...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={() => {
                    setCountriesLoaded(false);
                    loadAllCountries();
                  }}
                >
                  <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : countries.length === 0 ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Nenhum país encontrado</Text>
              </View>
            ) : (
              <FlatList
                data={countries}
                keyExtractor={(item) => item.code}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  modalContainer: { 
    backgroundColor: '#1D1926', 
    borderRadius: 24, 
    width: '100%', 
    maxWidth: 500, 
    alignSelf: 'center', 
    flexDirection: 'column', 
    overflow: 'hidden', 
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    borderBottomColor: '#2D2A36' 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
  closeButton: { 
    padding: 8 
  },
  closeButtonText: { 
    color: '#FFFFFF', 
    fontSize: 20, 
    fontWeight: '300' 
  },
  searchContainer: { 
    paddingHorizontal: 20, 
    paddingBottom: 16, 
    backgroundColor: '#1D1926' 
  },
  searchInput: { 
    backgroundColor: '#2D2A36', 
    borderRadius: 12, 
    padding: 12, 
    color: '#FFFFFF', 
    fontSize: 16,
    minHeight: 48
  },
  listContainer: { 
    flex: 1, 
    backgroundColor: '#1D1926' 
  },
  list: { 
    flex: 1, 
    backgroundColor: '#1D1926' 
  },
  listContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    backgroundColor: '#1D1926' 
  },
  countryItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 4, 
    backgroundColor: '#1D1926',
    minHeight: 60
  },
  flag: { 
    borderRadius: 4, 
    marginRight: 12 
  },
  countryInfo: { 
    flex: 1, 
    marginRight: 8 
  },
  countryName: { 
    fontSize: 16, 
    color: '#FFFFFF', 
    marginBottom: 4 
  },
  countryCode: { 
    fontSize: 14, 
    color: '#A0A0A0' 
  },
  separator: { 
    height: 1, 
    backgroundColor: '#2D2A36' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  loadingText: { 
    color: '#FFFFFF', 
    fontSize: 16 
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  errorText: { 
    color: '#FF6B6B', 
    fontSize: 16, 
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: '#2D2A36',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500'
  }
});
