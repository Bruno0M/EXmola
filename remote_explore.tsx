commit b88049e46580697fad8b55940cbd9fca5ceba41d
Author: KaykySiq <josekayky@hotmail.com>
Date:   Sun May 4 15:51:59 2025 -0300

    feat(PROJ-11): Adiciona a tela de Moedas selecionadas.

diff --git a/app/(tabs)/explore.tsx b/app/(tabs)/explore.tsx
index 06e70c4..fe10b02 100644
--- a/app/(tabs)/explore.tsx
+++ b/app/(tabs)/explore.tsx
@@ -1,109 +1,121 @@
-import { StyleSheet, Image, Platform } from 'react-native';
-
-import { Collapsible } from '@/components/Collapsible';
-import { ExternalLink } from '@/components/ExternalLink';
-import ParallaxScrollView from '@/components/ParallaxScrollView';
+import { StyleSheet, FlatList, View } from 'react-native';
 import { ThemedText } from '@/components/ThemedText';
 import { ThemedView } from '@/components/ThemedView';
-import { IconSymbol } from '@/components/ui/IconSymbol';
-
-export default function TabTwoScreen() {
-  return (
-    <ParallaxScrollView
-      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
-      headerImage={
-        <IconSymbol
-          size={310}
-          color="#808080"
-          name="chevron.left.forwardslash.chevron.right"
-          style={styles.headerImage}
-        />
-      }>
-      <ThemedView style={styles.titleContainer}>
-        <ThemedText type="title">Explore</ThemedText>
-      </ThemedView>
-      <ThemedText>This app includes example code to help you get started.</ThemedText>
-      <Collapsible title="File-based routing">
-        <ThemedText>
-          This app has two screens:{' '}
-          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
-          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
-        </ThemedText>
-        <ThemedText>
-          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
-          sets up the tab navigator.
-        </ThemedText>
-        <ExternalLink href="https://docs.expo.dev/router/introduction">
-          <ThemedText type="link">Learn more</ThemedText>
-        </ExternalLink>
-      </Collapsible>
-      <Collapsible title="Android, iOS, and web support">
-        <ThemedText>
-          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
-          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
-        </ThemedText>
-      </Collapsible>
-      <Collapsible title="Images">
-        <ThemedText>
-          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
-          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
-          different screen densities
-        </ThemedText>
-        <Image source={require('@/assets/images/react-logo.png')} style={{ alignSelf: 'center' }} />
-        <ExternalLink href="https://reactnative.dev/docs/images">
-          <ThemedText type="link">Learn more</ThemedText>
-        </ExternalLink>
-      </Collapsible>
-      <Collapsible title="Custom fonts">
-        <ThemedText>
-          Open <ThemedText type="defaultSemiBold">app/_layout.tsx</ThemedText> to see how to load{' '}
-          <ThemedText style={{ fontFamily: 'SpaceMono' }}>
-            custom fonts such as this one.
-          </ThemedText>
-        </ThemedText>
-        <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
-          <ThemedText type="link">Learn more</ThemedText>
-        </ExternalLink>
-      </Collapsible>
-      <Collapsible title="Light and dark mode components">
-        <ThemedText>
-          This template has light and dark mode support. The{' '}
-          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
-          what the user's current color scheme is, and so you can adjust UI colors accordingly.
-        </ThemedText>
-        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
-          <ThemedText type="link">Learn more</ThemedText>
-        </ExternalLink>
-      </Collapsible>
-      <Collapsible title="Animations">
-        <ThemedText>
-          This template includes an example of an animated component. The{' '}
-          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
-          the powerful <ThemedText type="defaultSemiBold">react-native-reanimated</ThemedText>{' '}
-          library to create a waving hand animation.
-        </ThemedText>
-        {Platform.select({
-          ios: (
-            <ThemedText>
-              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
-              component provides a parallax effect for the header image.
-            </ThemedText>
-          ),
-        })}
-      </Collapsible>
-    </ParallaxScrollView>
-  );
-}
+import ParallaxScrollView from '@/components/ParallaxScrollView';
+import { TextInput } from 'react-native';
 
 const styles = StyleSheet.create({
-  headerImage: {
-    color: '#808080',
-    bottom: -90,
-    left: -35,
-    position: 'absolute',
-  },
   titleContainer: {
     flexDirection: 'row',
     gap: 8,
+    marginBottom: 20,
+    paddingTop: 20,
+  },
+  listContainer: {
+    width: '100%',
+  },
+  itemContainer: {
+    flexDirection: 'row',
+    justifyContent: 'space-between',
+    alignItems: 'center',
+    paddingVertical: 15,
+    paddingHorizontal: 20,
+    marginVertical: 8,
+    backgroundColor: '#ffffff', // Fundo branco
+    borderRadius: 12,
+    shadowColor: '#000',
+    shadowOffset: { width: 0, height: 2 },
+    shadowOpacity: 0.1,
+    shadowRadius: 6,
+    elevation: 4, // Para Android
+  },
+  currencyText: {
+    fontSize: 18,
+    fontWeight: 'bold',
+    color: '#1a1a1a', // cor escura
+  },
+  amountContainer: {
+    alignItems: 'flex-end',
+  },
+  amountText: {
+  fontSize: 16,
+  color: '#1a1a1a',
+},
+equivalentText: {
+  fontSize: 14,
+  color: '#666666',
+  marginTop: 4,
+},
+
+  input: {
+    backgroundColor: '#ffffff',
+    paddingVertical: 2,
+    paddingHorizontal: 10,
+    borderRadius: 6,
+    fontSize: 16,
+    color: '#000000',
+    marginVertical: 4,
+    minWidth: 80,
+  },
+  equivalentInput: {
+    fontSize: 14,
+    color: '#666666',
   },
 });
+
+type SelectedItem = {
+  currency: string;
+  amount: string;
+  equivalent?: string;
+};
+
+export default function SelectedItemsScreen() {
+  const selectedItems: SelectedItem[] = [
+    { currency: 'AOA', amount: '10.000.000,00', equivalent: '(US)' },
+    { currency: 'BRL', amount: '10.000.000,00', equivalent: '(US)' },
+  ];
+
+  const renderItem = ({ item }: { item: SelectedItem }) => (
+    <ThemedView style={styles.itemContainer}>
+      <TextInput
+        value={item.currency}
+        style={styles.input}
+        editable={false}
+      />
+      <View style={styles.amountContainer}>
+        <TextInput
+          value={item.amount}
+          style={styles.input}
+          editable={true}
+        />
+        {item.equivalent && (
+          <TextInput
+            value={item.equivalent}
+            style={[styles.input, styles.equivalentInput]}
+            editable={true}
+          />
+        )}
+      </View>
+    </ThemedView>
+  );
+
+  return (
+    <ParallaxScrollView noHeader>
+      <ThemedView style={{ flex: 1, backgroundColor: '#101218' }}>
+        <ThemedView style={styles.titleContainer}>
+          <ThemedText type="title">Moedas Selecionadas</ThemedText>
+        </ThemedView>
+
+        <ThemedView style={styles.listContainer}>
+          <FlatList
+            data={selectedItems}
+            renderItem={renderItem}
+            keyExtractor={(item, index) => index.toString()}
+            scrollEnabled={false}
+            ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
+          />
+        </ThemedView>
+      </ThemedView>
+    </ParallaxScrollView>
+  );
+}
\ No newline at end of file
