import { ScrollView, StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';
import { WebAppProvider } from '@/contexts/WebAppContext';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

interface Props {
  children: React.ReactNode;
}

export function WebShell({ children }: Props) {
  const C = useThemeColors();

  return (
    <WebAppProvider>
      <View style={[styles.root, { backgroundColor: C.bg }]}>
        <AppSidebar />
        <View style={styles.main}>
          <AppHeader />
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {children}
          </ScrollView>
        </View>
      </View>
    </WebAppProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  main: {
    flex: 1,
    flexDirection: 'column',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
