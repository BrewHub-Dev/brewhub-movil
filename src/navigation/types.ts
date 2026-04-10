import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  BranchList: undefined;
  Menu: { branchId: string; branchName: string };
  Cart: { branchId: string };
  MyOrders: undefined;
  OrderDetails: { orderId: string };
  Favorites: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type BranchListScreenProps = NativeStackScreenProps<RootStackParamList, 'BranchList'>;
export type MenuScreenProps = NativeStackScreenProps<RootStackParamList, 'Menu'>;
export type CartScreenProps = NativeStackScreenProps<RootStackParamList, 'Cart'>;
export type MyOrdersScreenProps = NativeStackScreenProps<RootStackParamList, 'MyOrders'>;
export type OrderDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;
export type FavoritesScreenProps = NativeStackScreenProps<RootStackParamList, 'Favorites'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
