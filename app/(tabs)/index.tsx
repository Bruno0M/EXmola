import { Button, StyleSheet, View } from "react-native";
import * as Notifications from "expo-notifications";
import {
  addQuotation,
  getQuotations,
  initDatabase,
} from "@/data/database.native";
import { useEffect, useState } from "react";
import { Quotation } from "@/data/types";
import { registerForPushNotificationsAsync } from "@/services/notificationService";
import messaging from '@react-native-firebase/messaging';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function HomeScreen() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  useEffect(() => {
    const isHermes = () => !!(global as any).HermesInternal;
    console.log(isHermes());
    
    const setup = async () => {
      try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await registerForPushNotificationsAsync();
        console.log("Setting up database...");
        await initDatabase();
        await loadQuotations();
      } catch (error) {
        console.error("Error during setup:", error);
      }
    };
    
    setup();
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('Mensagem recebida em primeiro plano:', remoteMessage);
      // Aqui você pode usar expo-notifications para exibir a notificação localmente
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || "Nova Mensagem",
          body: remoteMessage.notification?.body || "Corpo da mensagem",
          data: remoteMessage.data,
        },
        trigger: null,
      });
    });
  
    // Handler para mensagens em segundo plano
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Mensagem recebida em segundo plano:', remoteMessage);
    });
  
    return unsubscribe;
  }, []);

  const sendTestNotification = async () => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test notification",
          data: { data: "Test data" },
        },
        trigger: null
      });
      console.log(`Notification scheduled with ID: ${notificationId}`);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

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
        title="Send Test Notificationn"
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

export default HomeScreen;