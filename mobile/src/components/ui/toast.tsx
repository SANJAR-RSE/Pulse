import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, space } from '@/theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';
interface ToastInput {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
interface ToastItem extends ToastInput {
  id: number;
}

const ToastContext = createContext<(t: ToastInput) => void>(() => {});
export const useToast = () => useContext(ToastContext);

const STYLE: Record<ToastType, { icon: keyof typeof Ionicons.glyphMap; fg: string; bg: string }> = {
  success: { icon: 'checkmark-circle', fg: colors.success, bg: colors.successSoft },
  error: { icon: 'alert-circle', fg: colors.danger, bg: colors.dangerSoft },
  info: { icon: 'information-circle', fg: colors.primary, bg: colors.primarySoft },
  warning: { icon: 'time', fg: colors.warning, bg: colors.warningSoft },
};

// Top-of-screen banners, one at a time (newest wins), tap to dismiss.
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const counter = useRef(0);
  const show = useCallback((t: ToastInput) => {
    counter.current += 1;
    setCurrent({ ...t, id: counter.current });
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {current && <ToastBanner key={current.id} toast={current} onDone={() => setCurrent(null)} />}
    </ToastContext.Provider>
  );
}

function ToastBanner({ toast, onDone }: { toast: ToastItem; onDone: () => void }) {
  const insets = useSafeAreaInsets();
  // Lazily-created state (not a ref) so the compiler can read it in render.
  const [anim] = useState(() => new Animated.Value(0));
  const s = STYLE[toast.type ?? 'info'];

  const hide = useCallback(() => {
    Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => onDone());
  }, [anim, onDone]);

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
    const timer = setTimeout(hide, toast.duration ?? 3500);
    return () => clearTimeout(timer);
  }, [anim, hide, toast.duration]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { top: insets.top + space.sm, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }] },
      ]}
    >
      <Pressable onPress={hide} style={[styles.toast, { borderLeftColor: s.fg }]} accessibilityRole="alert">
        <View style={[styles.iconWrap, { backgroundColor: s.bg }]}>
          <Ionicons name={s.icon} size={20} color={s.fg} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{toast.title}</Text>
          {!!toast.message && <Text style={styles.message}>{toast.message}</Text>}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space.lg, right: space.lg, zIndex: 1000 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space.md,
    borderLeftWidth: 4,
    ...shadow,
    shadowOpacity: 0.15,
    elevation: 8,
  },
  iconWrap: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  message: { fontSize: 13, color: colors.muted, marginTop: 2 },
});
