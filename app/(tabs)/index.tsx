import { StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
// import { addQuotation, getQuotations, initDatabase } from '@/data/database';
import { useEffect, useState } from 'react';
// import { Quotation } from '@/data/types';

export default function HomeScreen() {
  // const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);

  useEffect(() => {
    // const setupDatabase = async () => {
    //   try {
    //     console.log('Setting up database...');
    //     await initDatabase();
    //     // await handleAddQuotation(); // <-- Mock data insertion (commente this line after insertion)
    //     await loadQuotations();
    //   } catch (error) {
    //     console.error('Error setting up database:', error);
    //   }
    // };
    // setupDatabase();
  }, []);

  const loadQuotations = async () => {
    try {
      // const fetchedQuotations = await getQuotations() as Quotation[];
      // setQuotations(fetchedQuotations);
    } catch (error) {
      console.error('Error loading quotations:', error);
    }
  };

  //just for testing purposes, remove this function after testing
  const handleAddQuotation = async () => {
    try {
      const quotationsList = [
        {
          id: 0,
          currency: 'USD',
          latest_date: '2023-10-01',
          previous_date: '2023-09-30',
          latest_value: 1.0,
          previous_value: 0.95,
        },
        {
          id: 1,
          currency: 'EUR',
          latest_date: '2023-10-01',
          previous_date: '2023-09-30',
          latest_value: 0.85,
          previous_value: 0.80,
        },
        {
          id: 2,
          currency: 'GBP',
          latest_date: '2023-10-01',
          previous_date: '2023-09-30',
          latest_value: 0.75,
          previous_value: 0.70,
        },
      ];
      
      // for (const quotation of quotationsList) {
      //   await addQuotation(quotation);
      // }
      // await loadQuotations();
    } catch (error) {
      console.error('Error adding quotations:', error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#353636', dark: '#353636' }}
      headerImage={<HelloWave />}
    >
      <ThemedView style={[styles.container]}>
        <ThemedView style={[styles.titleContainer]}>
          <ThemedText type="title">Home</ThemedText>
        </ThemedView>
        {quotations.map((quotation) => (
          <ThemedText key={quotation.id} style={styles.quotationText}>
            {`${quotation.currency}: ${quotation.latest_value}`}
          </ThemedText>
        ))}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  quotationText: {
    marginVertical: 4,
  }
});
