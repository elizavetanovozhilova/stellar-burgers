import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { fetchFeed, selectOrders, selectTotalOrders, selectTodayOrders } from '../../services/slices/mainSlice';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const total = useSelector(selectTotalOrders);
  const totalToday = useSelector(selectTodayOrders);

  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  if (!orders.length) {
    return <Preloader />;
  }

  const handleGetFeeds = () => {
    dispatch(fetchFeed());
  };

  return (
    <FeedUI 
      orders={orders} 
      handleGetFeeds={handleGetFeeds}
    />
  );
};