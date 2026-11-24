import { Alert, Platform } from 'react-native';

// Yes/no confirmation that works everywhere. react-native-web's Alert.alert
// is a silent no-op, so on web (preview / UI tests) "Chiqish" and
// "Navbatni bekor qilish" would never run — use the browser dialog there.
export function confirmAction(title: string, message: string, confirmLabel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Yo'q", style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
