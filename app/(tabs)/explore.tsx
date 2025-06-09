import React from 'react';
import { StyleSheet, FlatList, View, TextInput, Text, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useState } from 'react';
import { CountrySelector, FlagWithFallback } from '@/components/CountrySelector';

type SelectedItem = {
  currency: string;
  amount: string;
  equivalent?: string;
  countryCode?: string;
  countryName?: string;
};

export default function SelectedItemsScreen() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([
    { currency: 'AOA', amount: '10.000.000,00', equivalent: '(AOA)', countryCode: 'AO', countryName: 'Angola' },
    { currency: 'BRL', amount: '10.000.000,00', equivalent: '(BRL)', countryCode: 'BR', countryName: 'Brasil' },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelectCountry = (country: any) => {
    const newItem: SelectedItem = {
      currency: country.currency.code,
      amount: '0,00',
      equivalent: `(${country.currency.code})`,
      countryCode: country.code,
      countryName: country.name
    };
    setSelectedItems(items => [...items, newItem]);
  };

  const renderItem = ({ item }: { item: SelectedItem }) => (
    <ThemedView style={styles.itemContainer}>
      {item.countryCode && (
        <View style={styles.flagContainer}>
          <FlagWithFallback countryCode={item.countryCode} size={30} />
        </View>
      )}
      <View style={styles.currencyInfo}>
        <TextInput
          value={item.currency}
          style={styles.currencyInput}
          editable={false}
        />
        {item.countryName && (
          <Text style={styles.countryName}>{item.countryName}</Text>
        )}
      </View>
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
              keyExtractor={(item) => `${item.countryCode}-${item.currency}`}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
            />
          </ThemedView>
        </ThemedView>
      </ParallaxScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.plusSign}>+</Text>
      </TouchableOpacity>

      <CountrySelector 
        onSelectCountry={handleSelectCountry}
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
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
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 6,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  flagContainer: {
    marginRight: 8,
  },
  currencyInfo: {
    flex: 1,
    marginRight: 8,
  },
  currencyInput: {
    backgroundColor: '#ffffff',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    fontSize: 14,
    color: '#000000',
    minWidth: 50,
  },
  countryName: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  input: {
    backgroundColor: '#ffffff',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    fontSize: 14,
    color: '#000000',
    marginVertical: 2,
    minWidth: 90,
    textAlign: 'right',
  },
  equivalentInput: {
    fontSize: 12,
    color: '#666666',
  },
  floatingButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8AB4F8',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 100, // Aumentado para 100 para ficar mais acima
    right: 16,
    elevation: 8, // Aumentado para melhor visibilidade
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
  plusSign: {
    fontSize: 32,
    color: '#000000',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 32,
  },
});