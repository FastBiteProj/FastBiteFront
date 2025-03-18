import { useTranslation } from 'react-i18next';
import "./OrdersHistory.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../redux/reducers/profileSlice';
import React from 'react';

export const OrdersHistory = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { orders, ordersStatus, ordersError } = useSelector((state) => state.profile);
  const [expandedOrderIndex, setExpandedOrderIndex] = useState(null);

  useEffect(() => {
    dispatch(fetchOrders())
      .unwrap()
      .catch(error => {
        console.error('Failed to fetch orders:', error);
      });
  }, [dispatch]);

  const toggleExpand = (index) => {
    setExpandedOrderIndex(expandedOrderIndex === index ? null : index);
  };

  const formatPrice = (price) => `$${price}`;
 
  return (
    <div className="OrdersHistory">
      <div className="OrdersHistory__left-side">
        <div className="OrdersHistory__background"></div>
        <div></div>
        <div className='OrdersHistory__headers'>
        <span className="OrdersHistory__left-top">
          {t('ordersHistory.title.top')}
        </span>
        <span className="OrdersHistory__left-bot">
          {t('ordersHistory.title.bottom')}
        </span>
        </div>

        <Navbar />
      </div>

      <div className="OrdersHistory__right-side">
        <h2 className="OrdersHistory__title">
          {t('ordersHistory.title.main')}
        </h2>
        
        {ordersStatus === 'loading' && (
          <div className="OrdersHistory__loading">
            {t('ordersHistory.status.loading')}
          </div>
        )}

        {ordersError && (
          <div className="OrdersHistory__error">
            {t('ordersHistory.status.error', { message: ordersError })}
          </div>
        )}

        {ordersStatus === 'succeeded' && orders.length === 0 && (
          <div className="OrdersHistory__empty">
            {t('ordersHistory.status.empty')}
          </div>
        )}

        {ordersStatus === 'succeeded' && orders.length > 0 && (
          <table className="OrdersHistory__table">
            <thead>
              <tr>
                <th></th>
                <th>{t('ordersHistory.table.date')}</th>
                <th>{t('ordersHistory.table.table')}</th>
                <th>{t('ordersHistory.table.totalPrice')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <React.Fragment key={order.id || `order-${index}`}>
                  <tr
                    onClick={() => toggleExpand(index)}
                    className="OrdersHistory__row"
                  >
                    <td>{expandedOrderIndex === index ? "▼" : "▶"}</td>
                    <td>{new Date(order.confirmationDate).toLocaleDateString()}</td>
                    <td>{order.tableNumber > 0 ? `T${order.tableNumber}` : 'N/A'}</td>
                    <td>{formatPrice(order.totalPrice)}</td>
                  </tr>

                  {expandedOrderIndex === index && (
                    <tr className="OrdersHistory__details">
                      <td colSpan="4">
                        <table className="OrdersHistory__details-table">
                          <thead>
                            <tr>
                              <th>{t('ordersHistory.table.product')}</th>
                              <th>{t('ordersHistory.table.quantity')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.productNames?.map((product, detailIndex) => (
                              <tr key={`${order.id}-product-${detailIndex}`}>
                                <td>{product.productName}</td>
                                <td>{product.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
