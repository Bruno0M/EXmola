import { Button, StyleSheet, View } from "react-native";
import * as Notifications from "expo-notifications";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  addQuotation,
  getQuotations,
  initDatabase,
} from "@/data/database.native";
import { useEffect, useRef, useState } from "react";
import { Quotation } from "@/data/types";
import { registerForPushNotificationsAsync } from "@/services/notificationService";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response received:", response);
      });

    const setupDatabase = async () => {
      try {
        console.log("Setting up database...");
        await initDatabase();
        // await handleAddQuotation(); // <-- Mock data insertion (commente this line after insertion)
        await loadQuotations();
      } catch (error) {
        console.error("Error setting up database:", error);
      }
    };
    setupDatabase();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test notification",
        data: { data: "Test data" },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
    });
  }

  const loadQuotations = async () => {
    try {
      const fetchedQuotations = (await getQuotations()) as Quotation[];
      setQuotations(fetchedQuotations);
    } catch (error) {
      console.error("Error loading quotations:", error);
    }
  };

  //just for testing purposes, remove this function after testing
  const handleAddQuotation = async () => {
    try {
      const quotationsList = [
        {
          id: 0,
          currency: "USD",
          latest_date: "2023-10-01",
          previous_date: "2023-09-30",
          latest_value: 1.0,
          previous_value: 0.95,
        },
        {
          id: 1,
          currency: "EUR",
          latest_date: "2023-10-01",
          previous_date: "2023-09-30",
          latest_value: 0.85,
          previous_value: 0.8,
        },
        {
          id: 2,
          currency: "GBP",
          latest_date: "2023-10-01",
          previous_date: "2023-09-30",
          latest_value: 0.75,
          previous_value: 0.7,
        },
      ];

      for (const quotation of quotationsList) {
        await addQuotation(quotation);
      }
      await loadQuotations();
    } catch (error) {
      console.error("Error adding quotations:", error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button
        title="Send Test Notification"
        onPress={sendTestNotification}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  quotationText: {
    marginVertical: 4,
  },
});
