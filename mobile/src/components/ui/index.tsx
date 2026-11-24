import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, shadow, space } from '@/theme';

export type IconName = keyof typeof Ionicons.glyphMap;

// ---------- Screen: safe area + scroll + pull-to-refresh ----------
export function Screen({
  children,
  onRefresh,
  refreshing = false,
  scroll = true,
  padded = true,
  style,
}: {
  children: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const pad = padded ? { padding: space.lg, paddingBottom: space.xxxl } : null;
  if (!scroll) return <View style={[styles.screen, pad, style]}>{children}</View>;
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[pad, { gap: space.lg }, style]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} /> : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

// ---------- Card ----------
export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ---------- Button ----------
type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'soft' | 'success';
export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  size = 'md',
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}) {
  const v = VARIANTS[variant];
  const h = size === 'sm' ? 36 : size === 'lg' ? 54 : 46;
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      style={({ pressed }) => [
        styles.btn,
        { height: h, backgroundColor: v.bg, borderColor: v.border, paddingHorizontal: size === 'sm' ? space.md : space.lg },
        pressed && !off && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        off && { opacity: 0.55 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        icon && <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={v.fg} />
      )}
      <Text style={[styles.btnText, { color: v.fg, fontSize: size === 'sm' ? 13 : size === 'lg' ? 17 : 15 }]}>{title}</Text>
    </Pressable>
  );
}
const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  outline: { bg: colors.card, fg: colors.text, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
  soft: { bg: colors.primarySoft, fg: colors.primary, border: colors.primarySoft },
  success: { bg: colors.success, fg: colors.white, border: colors.success },
};

// ---------- Input ----------
export function Input({ label, error, ...props }: TextInputProps & { label?: string; error?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor="#94A3B8"
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[
          styles.input,
          props.multiline && { height: 96, textAlignVertical: 'top', paddingTop: 12 },
          focused && { borderColor: colors.primary },
          !!error && { borderColor: colors.danger },
          props.style,
        ]}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

// ---------- Badge / Chip ----------
export function Badge({ label, tone = 'primary', icon }: { label: string; tone?: 'primary' | 'success' | 'warning' | 'danger' | 'muted'; icon?: IconName }) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      {icon && <Ionicons name={icon} size={12} color={t.fg} />}
      <Text style={[styles.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}
const TONES = {
  primary: { bg: colors.primarySoft, fg: colors.primary },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  muted: { bg: '#F1F5F9', fg: colors.muted },
};

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
    >
      <Text style={[styles.chipText, active && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

// ---------- Progress ----------
export function Progress({ value, color = colors.primary }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progress}>
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: radius.pill }} />
    </View>
  );
}

// ---------- Avatar ----------
export function Avatar({ text, size = 44, tone = colors.primary }: { text: string; size?: number; tone?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: tone, fontWeight: '700', fontSize: size * 0.36 }}>{text}</Text>
    </View>
  );
}

export function IconBox({ name, color = colors.primary, bg = colors.primarySoft, size = 40 }: { name: IconName; color?: string; bg?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius.md, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={name} size={size * 0.5} color={color} />
    </View>
  );
}

// ---------- States: loading / empty / error ----------
export function LoadingState({ label = 'Yuklanmoqda...' }: { label?: string }) {
  return (
    <View style={styles.state}>
      <ActivityIndicator color={colors.primary} />
      <Text style={font.small}>{label}</Text>
    </View>
  );
}
export function EmptyState({
  title = "Hozircha ma'lumot yo'q.",
  description,
  icon = 'file-tray-outline',
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={[styles.state, styles.stateBox]}>
      <IconBox name={icon} color={colors.muted} bg="#F1F5F9" size={48} />
      <Text style={[font.h3, { textAlign: 'center' }]}>{title}</Text>
      {!!description && <Text style={[font.small, { textAlign: 'center' }]}>{description}</Text>}
      {actionLabel && onAction && <Button title={actionLabel} onPress={onAction} size="sm" style={{ marginTop: space.xs }} />}
    </View>
  );
}
export function ErrorState({ message = "Ma'lumotlarni yuklab bo'lmadi.", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View style={[styles.state, styles.stateBox, { borderColor: '#FECACA', backgroundColor: colors.dangerSoft }]}>
      <Ionicons name="cloud-offline-outline" size={28} color={colors.danger} />
      <Text style={[font.body, { textAlign: 'center', color: colors.text }]}>{message}</Text>
      {onRetry && <Button title="Qayta urinish" icon="refresh" variant="outline" size="sm" onPress={onRetry} />}
    </View>
  );
}

// ---------- Section title ----------
export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={font.h3}>{title}</Text>
      {action && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ---------- Row (settings / menu) ----------
export function Row({ icon, title, subtitle, onPress, right, danger }: { icon: IconName; title: string; subtitle?: string; onPress?: () => void; right?: React.ReactNode; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && onPress && { backgroundColor: '#F8FAFC' }]}>
      <IconBox name={icon} size={36} color={danger ? colors.danger : colors.primary} bg={danger ? colors.dangerSoft : colors.primarySoft} />
      <View style={{ flex: 1 }}>
        <Text style={[font.h3, { fontSize: 15 }, danger && { color: colors.danger }]}>{title}</Text>
        {!!subtitle && <Text style={font.small}>{subtitle}</Text>}
      </View>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={18} color="#94A3B8" />)}
    </Pressable>
  );
}

// ---------- Bottom sheet (modal) ----------
export function Sheet({ visible, onClose, title, subtitle, children }: { visible: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Yopish" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}>
          <View style={styles.grabber} />
          <View style={styles.sheetHead}>
            <View style={{ flex: 1 }}>
              <Text style={font.h2}>{title}</Text>
              {!!subtitle && <Text style={[font.small, { marginTop: 2 }]}>{subtitle}</Text>}
            </View>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Yopish">
              <Ionicons name="close" size={24} color={colors.muted} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: space.lg }} style={{ maxHeight: 520 }}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------- Time field (HH:mm with steppers — no native picker needed) ----------
export function TimeField({ label, value, onChange, minuteStep = 5 }: { label: string; value: string; onChange: (v: string) => void; minuteStep?: number }) {
  const [h, m] = value.split(':').map(Number);
  const set = (nh: number, nm: number) => onChange(`${String((nh + 24) % 24).padStart(2, '0')}:${String((nm + 60) % 60).padStart(2, '0')}`);
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.timeBox}>
        <Stepper value={String(h).padStart(2, '0')} onUp={() => set(h + 1, m)} onDown={() => set(h - 1, m)} label="soat" />
        <Text style={styles.timeColon}>:</Text>
        <Stepper value={String(m).padStart(2, '0')} onUp={() => set(h, m + minuteStep)} onDown={() => set(h, m - minuteStep)} label="daqiqa" />
      </View>
    </View>
  );
}
function Stepper({ value, onUp, onDown, label }: { value: string; onUp: () => void; onDown: () => void; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable onPress={onUp} hitSlop={6} accessibilityLabel={`${label} oshirish`}>
        <Ionicons name="chevron-up" size={22} color={colors.primary} />
      </Pressable>
      <Text style={styles.timeValue}>{value}</Text>
      <Pressable onPress={onDown} hitSlop={6} accessibilityLabel={`${label} kamaytirish`}>
        <Ionicons name="chevron-down" size={22} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, borderWidth: 1, borderColor: colors.border, ...shadow },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, borderRadius: radius.md, borderWidth: 1 },
  btnText: { fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSoft },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.card,
  },
  error: { fontSize: 12, color: colors.danger },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  chip: { paddingHorizontal: 14, height: 36, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.textSoft },
  progress: { height: 8, borderRadius: radius.pill, backgroundColor: '#EEF2F7', overflow: 'hidden' },
  state: { alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingVertical: space.xxl },
  stateBox: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.card, paddingHorizontal: space.lg },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, paddingHorizontal: space.xs, borderRadius: radius.md },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: space.xl, paddingTop: space.sm },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: space.md },
  sheetHead: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, marginBottom: space.lg },
  timeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: space.sm },
  timeColon: { fontSize: 26, fontWeight: '700', color: colors.text },
  timeValue: { fontSize: 26, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'], minWidth: 40, textAlign: 'center' },
});
