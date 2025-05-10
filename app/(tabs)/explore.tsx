import React from 'react';
import { StyleSheet, FlatList, View, TextInput, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useState } from 'react';
import { CountrySelector, FlagWithFallback } from '@/src/components/CountrySelector';

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

  const handleSelectCountry = (country: any) => {
    const newItem: SelectedItem = {
      currency: country.currency.code,
      amount: '0,00',
      equivalent: `(${country.currency.code})`,
      countryCode: country.code,
      countryName: country.name
    };
    setSelectedItems([...selectedItems, newItem]);
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
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
            />
          </ThemedView>
        </ThemedView>
      </ParallaxScrollView>

      <CountrySelector onSelectCountry={handleSelectCountry} />
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
  currencyInfo: {
    flex: 1,
  },
  currencyInput: {
    backgroundColor: '#ffffff',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 16,
    color: '#000000',
    minWidth: 60,
  },
  countryName: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  amountContainer: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  input: {
    backgroundColor: '#ffffff',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 16,
    color: '#000000',
    marginVertical: 4,
    minWidth: 120,
    textAlign: 'right',
  },
  equivalentInput: {
    fontSize: 14,
    color: '#666666',
  },
});