import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  useWindowDimensions,
} from 'react-native';
import { ArrowLeft, Heart, Minus, Plus } from 'lucide-react-native';
import type { Item, ItemModifier } from '../../../shared/types/items.types';
import { ModifierOption } from './ModifierOption';
import { COFFEE } from '../constants/coffee';

type Colors = {
  bg: string;
  sheet: string;
  title: string;
  text: string;
  muted: string;
  card: string;
  border: string;
  icon: string;
};

type ItemHeroProps = {
  item: Item;
  height: number;
  isDark: boolean;
  colors: Colors;
  onClose: () => void;
};

function ItemHero({ item, height, isDark, colors, onClose }: Readonly<ItemHeroProps>) {
  const btnStyle = {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? 'rgba(24,24,27,0.7)' : 'rgba(255,255,255,0.85)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  return (
    <View style={{ height: height * 0.42, position: 'relative' }}>
      {item.images?.length ? (
        <Image
          source={{ uri: item.images[0] }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? '#1c1917' : COFFEE.latte,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 80 }}>☕</Text>
        </View>
      )}

      <View
        style={{
          position: 'absolute',
          top: 56,
          left: 20,
          right: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity onPress={onClose} style={btnStyle}>
          <ArrowLeft size={20} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={btnStyle}>
          <Heart size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

type ItemHeaderProps = {
  item: Item;
  quantity: number;
  isDark: boolean;
  colors: Colors;
  onChangeQuantity: (delta: number) => void;
};

function ItemHeader({ item, quantity, isDark, colors, onChangeQuantity }: Readonly<ItemHeaderProps>) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.title }}>
          {item.name}
        </Text>
        {item.description ? (
          <Text style={{ marginTop: 6, fontSize: 14, color: colors.muted }}>
            {item.description}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 18,
          padding: 4,
          backgroundColor: isDark ? '#27272a' : COFFEE.latte,
        }}
      >
        <TouchableOpacity
          onPress={() => onChangeQuantity(-1)}
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Minus size={14} color={colors.icon} />
        </TouchableOpacity>

        <Text
          style={{
            width: 36,
            textAlign: 'center',
            fontWeight: '700',
            fontSize: 16,
            color: colors.title,
          }}
        >
          {quantity}
        </Text>

        <TouchableOpacity
          onPress={() => onChangeQuantity(1)}
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            backgroundColor: isDark ? COFFEE.mocha : COFFEE.caramel,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

type ModifiersListProps = {
  modifiers: ItemModifier[];
  selectedModifiers: Record<string, string>;
  isDark: boolean;
  colors: Colors;
  onSelectModifier: (modifierName: string, optionName: string) => void;
};

function ModifiersList({
  modifiers,
  selectedModifiers,
  isDark,
  colors,
  onSelectModifier,
}: Readonly<ModifiersListProps>) {
  if (!modifiers.length) return null;

  return (
    <View style={{ marginTop: 28 }}>
      <Text
        style={{
          fontSize: 17,
          fontWeight: '700',
          color: colors.title,
          marginBottom: 18,
        }}
      >
        Personaliza tu bebida
      </Text>

      {modifiers.map((modifier) => (
        <View key={modifier.name} style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 10,
            }}
          >
            {modifier.name}
            {modifier.required ? <Text style={{ color: '#ef4444' }}> *</Text> : null}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {modifier.options.map((option) => (
              <ModifierOption
                key={option.name}
                option={option}
                isSelected={selectedModifiers[modifier.name] === option.name}
                isDark={isDark}
                onSelect={() => onSelectModifier(modifier.name, option.name)}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

type AddToCartBarProps = {
  isDark: boolean;
  colors: Colors;
  total: number;
  onAddToCart: () => void;
};

function AddToCartBar({ isDark, colors, total, onAddToCart }: Readonly<AddToCartBarProps>) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        backgroundColor: isDark ? 'rgba(9,9,11,0.95)' : 'rgba(255,255,255,0.95)',
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <TouchableOpacity
        onPress={onAddToCart}
        activeOpacity={0.9}
        style={{
          backgroundColor: isDark ? COFFEE.mocha : COFFEE.caramel,
          borderRadius: 22,
          paddingVertical: 16,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, marginRight: 12 }}>
          Agregar al carrito
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 16 }}>
          ${total.toFixed(2)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── DetailModal ──────────────────────────────────────────────────────────────

type DetailModalProps = {
  selectedItem: Item | null;
  selectedModifiers: Record<string, string>;
  quantity: number;
  isDark: boolean;
  onClose: () => void;
  onSelectModifier: (modifierName: string, optionName: string) => void;
  onChangeQuantity: (delta: number) => void;
  onAddToCart: () => void;
  getModalTotal: () => number;
};

export function DetailModal({
  selectedItem,
  selectedModifiers,
  quantity,
  isDark,
  onClose,
  onSelectModifier,
  onChangeQuantity,
  onAddToCart,
  getModalTotal,
}: Readonly<DetailModalProps>) {
  const { height } = useWindowDimensions();
  if (!selectedItem) return null;

  const colors: Colors = {
    bg: isDark ? '#09090b' : '#f5f5f4',
    sheet: isDark ? '#18181b' : '#ffffff',
    title: isDark ? '#fafaf9' : COFFEE.darkRoast,
    text: isDark ? '#e4e4e7' : '#44403c',
    muted: isDark ? '#a1a1aa' : '#78716c',
    card: isDark ? '#27272a' : '#ffffff',
    border: isDark ? '#3f3f46' : '#e7e5e4',
    icon: isDark ? '#fafaf9' : COFFEE.espresso,
  };

  return (
    <Modal
      visible={!!selectedItem}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ItemHero
          item={selectedItem}
          height={height}
          isDark={isDark}
          colors={colors}
          onClose={onClose}
        />

        <View
          style={{
            flex: 1,
            marginTop: -28,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 24,
            backgroundColor: colors.sheet,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <ItemHeader
              item={selectedItem}
              quantity={quantity}
              isDark={isDark}
              colors={colors}
              onChangeQuantity={onChangeQuantity}
            />

            <ModifiersList
              modifiers={selectedItem.modifiers ?? []}
              selectedModifiers={selectedModifiers}
              isDark={isDark}
              colors={colors}
              onSelectModifier={onSelectModifier}
            />

            <View style={{ height: 120 }} />
          </ScrollView>
        </View>

        <AddToCartBar
          isDark={isDark}
          colors={colors}
          total={getModalTotal()}
          onAddToCart={onAddToCart}
        />
      </View>
    </Modal>
  );
}
