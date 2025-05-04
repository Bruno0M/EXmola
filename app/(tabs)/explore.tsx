import { StyleSheet, FlatList, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { TextInput } from 'react-native';

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
    backgroundColor: '#ffffff', // Fundo branco
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4, // Para Android
  },
  currencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a', // cor escura
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
});

type SelectedItem = {
  currency: string;
  amount: string;
  equivalent?: string;
};

export default function SelectedItemsScreen() {
  const selectedItems: SelectedItem[] = [
    { currency: 'AOA', amount: '10.000.000,00', equivalent: '(US)' },
    { currency: 'BRL', amount: '10.000.000,00', equivalent: '(US)' },
  ];

  const renderItem = ({ item }: { item: SelectedItem }) => (
    <ThemedView style={styles.itemContainer}>
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
  );
}