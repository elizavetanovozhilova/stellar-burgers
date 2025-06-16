import { ProfileOrdersUI } from '@ui-pages';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import { selectUserOrders } from '../../services/slices/mainSlice';

export const ProfileOrders: FC = () => {
  const orders = useSelector(selectUserOrders);

  return <ProfileOrdersUI orders={orders || []} />;
};