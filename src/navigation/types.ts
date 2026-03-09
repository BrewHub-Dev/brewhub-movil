import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: { inviteCode?: string } | undefined;
  QRScanner: { fromRegister?: boolean } | undefined;
  Home: undefined;
  BranchList: undefined;
  Menu: { branchId: string; branchName: string };
  Cart: { branchId: string };
  MyOrders: undefined;
  OrderDetails: { orderId: string };
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type BranchListScreenProps = NativeStackScreenProps<RootStackParamList, 'BranchList'>;
export type MenuScreenProps = NativeStackScreenProps<RootStackParamList, 'Menu'>;
export type CartScreenProps = NativeStackScreenProps<RootStackParamList, 'Cart'>;
export type MyOrdersScreenProps = NativeStackScreenProps<RootStackParamList, 'MyOrders'>;
export type OrderDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;
