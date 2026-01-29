// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'play.fill': 'play-arrow',
  'flame.fill': 'local-fire-department',
  'lightbulb.fill': 'lightbulb',
  'sparkles': 'auto-awesome',
  'brain.headset': 'self-improvement',
  'hourglass': 'hourglass-empty',
  'heart.fill': 'favorite',
  'settings': 'settings',
  'spa': 'spa',
  'calendar': 'calendar-today',
  'timer': 'timer',
  'star.fill': 'star',
  'star.leadinghalf.filled': 'star-half',
  'star': 'star-outline',
  'arrow.up': 'arrow-upward',
  'shield.lock': 'shield-lock',
  'chevron.left': 'chevron-left',
  'sun.max.fill': 'wb-sunny',
  'moon.fill': 'nights-stay',
  'twilight': 'wb-twilight',
  'book.fill': 'menu-book',
  'search': 'search',
  'bookmark.fill': 'bookmark',
  'fork.knife': 'restaurant',
  'fort.fill': 'fort',
  'leaf.fill': 'potted-plant',
  'shield.person.fill': 'shield-person',
  'auto.stories': 'auto-stories',
  'arrow.left': 'arrow-back-ios',
  'pencil': 'edit',
  'slider.horizontal.3': 'tune',
  'doc.text': 'description',
  'bell.fill': 'notifications-active',
  'square.and.arrow.up.fill': 'file-export',
  'trash.fill': 'delete-forever',
  'person.fill': 'person',
  'close': 'close',
  'eco': 'eco',
  'lock.fill': 'lock',
  'waves': 'waves',
  'pause.fill': 'pause',
  'volume.up.fill': 'volume-up',
  'database': 'database',
  'church': 'church',
  'mosque': 'mosque',
  'temple.buddhist': 'temple-buddhist',
  'checkmark': 'check',
  'arrow.left.ios': 'arrow-back-ios-new',
  'info.circle': 'info',
  'location.fill': 'location-on',
  'kaaba': 'temple-hindu',
  'volume.3.fill': 'volume-up',
  'music.note': 'music-note',
  'text.quote': 'format-quote',
  'flower.fill': 'filter-vintage',
  'checkmark.circle.fill': 'check-circle',
  'heart.text.square.fill': 'health-and-safety',
  'drop.fill': 'water-drop',
  'play.circle.fill': 'play-circle',
  'chevron.up.double': 'keyboard-double-arrow-up',
} as const satisfies IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  // weight is accepted for API compatibility with iOS SF Symbols but has no effect on Material Icons  
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
