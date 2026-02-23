import { useState, useMemo } from 'react';
import type { Item } from '../../../shared/types/items.types';
import type { CreateOrderItemInput } from '../../../shared/types/orders.types';

export interface CartItem {
  item: Item;
  quantity: number;
  selectedModifiers: {
    name: string;
    optionName: string;
  }[];
  notes?: string;
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (
    item: Item,
    quantity: number = 1,
    modifiers: { name: string; optionName: string }[] = [],
    notes?: string
  ) => {
    setCartItems((prev) => {
      // Verificar si el item ya existe con los mismos modificadores
      const existingIndex = prev.findIndex(
        (cartItem) =>
          cartItem.item._id === item._id &&
          JSON.stringify(cartItem.selectedModifiers) === JSON.stringify(modifiers) &&
          cartItem.notes === notes
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, { item, quantity, selectedModifiers: modifiers, notes }];
    });
  };

  const removeFromCart = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const calculateItemTotal = (cartItem: CartItem): number => {
    let total = cartItem.item.price;

    // Agregar precio de modificadores
    cartItem.selectedModifiers.forEach((selectedMod) => {
      const modifier = cartItem.item.modifiers?.find((m) => m.name === selectedMod.name);
      const option = modifier?.options.find((o) => o.name === selectedMod.optionName);
      if (option) {
        total += option.extraPrice;
      }
    });

    return total * cartItem.quantity;
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, cartItem) => sum + calculateItemTotal(cartItem), 0);
  }, [cartItems]);

  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
  }, [cartItems]);

  const toOrderItems = (): CreateOrderItemInput[] => {
    return cartItems.map((cartItem) => ({
      itemId: cartItem.item._id,
      quantity: cartItem.quantity,
      modifiers: cartItem.selectedModifiers.length > 0 ? cartItem.selectedModifiers : undefined,
      notes: cartItem.notes,
    }));
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateItemTotal,
    subtotal,
    itemCount,
    toOrderItems,
  };
}
