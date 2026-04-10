import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import { Clock, X, Calendar } from 'lucide-react-native';

interface SchedulePickerProps {
  isDark: boolean;
  scheduledTime: Date | null;
  onScheduleChange: (time: Date | null) => void;
}

const TIME_SLOTS = [
  { label: 'Ahora', minutes: 0 },
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hora', minutes: 60 },
  { label: '1.5 horas', minutes: 90 },
  { label: '2 horas', minutes: 120 },
];

export function SchedulePicker({ isDark, scheduledTime, onScheduleChange }: Readonly<SchedulePickerProps>) {
  const [showModal, setShowModal] = useState(false);
  
  const getScheduledLabel = () => {
    if (!scheduledTime) return 'Ahora';
    
    const now = new Date();
    const diff = scheduledTime.getTime() - now.getTime();
    const minutes = Math.round(diff / 60000);
    
    if (minutes <= 0) return 'Ahora';
    if (minutes < 60) return `En ${minutes} min`;
    const hours = Math.round(minutes / 60);
    return `En ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  };

  const handleSelectNow = () => {
    onScheduleChange(null);
    setShowModal(false);
  };

  const handleSelectSlot = (minutes: number) => {
    const scheduledDate = new Date();
    scheduledDate.setMinutes(scheduledDate.getMinutes() + minutes);
    onScheduleChange(scheduledDate);
    setShowModal(false);
  };

  const isScheduled = scheduledTime !== null;

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
        style={{
          backgroundColor: isDark ? '#18181b' : '#fff',
          borderColor: isDark ? '#f59e0b' : '#e5e7eb',
        }}
        className="rounded-3xl p-5 mb-4 border"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Clock size={20} color={isDark ? '#f59e0b' : '#f59e0b'} />
            <Text className={`text-lg font-bold ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Programar pedido
            </Text>
          </View>
          <View
            className={`px-3 py-1.5 rounded-xl ${
              isScheduled
                ? 'bg-amber-500/20'
                : isDark
                ? 'bg-zinc-800'
                : 'bg-gray-100'
            }`}
          >
            <Text
              className={`font-medium text-sm ${
                isScheduled
                  ? isDark
                    ? 'text-amber-400'
                    : 'text-amber-700'
                  : isDark
                  ? 'text-zinc-400'
                  : 'text-gray-500'
              }`}
            >
              {getScheduledLabel()}
            </Text>
          </View>
        </View>
        
        {isScheduled && scheduledTime && (
          <View className={`mt-3 pt-3 border-t ${isDark ? 'border-zinc-800' : 'border-gray-100'}`}>
            <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
              Recoger a las {scheduledTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View
            style={{
              backgroundColor: isDark ? '#18181b' : '#fff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
            className="pb-8"
          >
            <View className="flex-row items-center justify-between p-5 border-b border-zinc-800">
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Programar recogida
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={24} color={isDark ? '#a1a1aa' : '#6b7280'} />
              </TouchableOpacity>
            </View>

            <View className="px-5 pt-5">
              <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                ¿Cuándo quieres recoger tu pedido?
              </Text>
              
              <TouchableOpacity
                onPress={handleSelectNow}
                activeOpacity={0.7}
                className={`flex-row items-center justify-between p-4 rounded-2xl mb-3 border ${
                  !isScheduled
                    ? 'border-amber-500 bg-amber-500/10'
                    : isDark
                    ? 'border-zinc-800 bg-zinc-800/50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <View className="flex-row items-center">
                  <Calendar size={20} color={!isScheduled ? '#f59e0b' : (isDark ? '#a1a1aa' : '#6b7280')} />
                  <Text className={`ml-3 font-medium ${!isScheduled ? (isDark ? 'text-amber-400' : 'text-amber-700') : (isDark ? 'text-zinc-300' : 'text-gray-700')}`}>
                    Lo antes posible
                  </Text>
                </View>
                {!isScheduled && (
                  <View className="bg-amber-500 rounded-full p-1">
                    <View className="w-3 h-3 bg-white rounded-full" />
                  </View>
                )}
              </TouchableOpacity>

              <Text className={`text-sm font-medium mt-4 mb-3 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                O selecciona un horario:
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {TIME_SLOTS.slice(1).map((slot) => {
                  const isSelected = scheduledTime !== null && scheduledTime.getTime() === new Date(Date.now() + slot.minutes * 60000).getTime();
                  return (
                    <TouchableOpacity
                      key={slot.minutes}
                      onPress={() => handleSelectSlot(slot.minutes)}
                      activeOpacity={0.7}
                      className={`px-4 py-3 rounded-2xl border ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10'
                          : isDark
                          ? 'border-zinc-800 bg-zinc-800/50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <Text
                        className={`font-medium ${
                          isSelected
                            ? isDark
                              ? 'text-amber-400'
                              : 'text-amber-700'
                            : isDark
                            ? 'text-zinc-300'
                            : 'text-gray-700'
                        }`}
                      >
                        {slot.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}