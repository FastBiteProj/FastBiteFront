import "./OrdersHistory.css";
import Modal from "../Modal/Modal";
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, fetchUsers } from '../../../redux/reducers/profileSlice';
import { SearchOrdersHistoryForm } from "../Forms/SearchOrdersHistoryForm/SearchOrdersHistoryForm";

export const OrdersHistory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { orders, ordersStatus, ordersError } = useSelector((state) => state.profile);
  const users = useSelector((state) => state.profile.users);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchUsers());
  }, [dispatch]);

  const getUserInfo = useMemo(() => {
    return (userId) => {
      if (!Array.isArray(users) || users.length === 0) {
        return null;
      }
      const user = users.find(user => user.id === userId);
      return user;
    };
  }, [users]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (ordersStatus === "loading") {
    return <div>Loading orders...</div>;
  }

  if (ordersStatus === "failed") {
    return <div>Error loading orders: {ordersError}</div>;
  }

  return (
    <div className="orders-history">
      <h2 className="orders-title" onClick={openModal}>Orders History</h2>
      <div className="orders-table-container">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Table</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => {
              const user = getUserInfo(order.userId);
              return (
                <tr key={order.id}>
                  <td>
                    {user 
                      ? `${user.firstName} ${user.lastName}` 
                      : `Unknown User (ID: ${order.userId})`
                    }
                  </td>
                  <td>
                    {user && (
                      <>
                        {user.phoneNumber}<br/>
                        {user.email}
                      </>
                    )}
                  </td>
                  <td>{formatDate(order.confirmationDate)}</td>
                  <td>${order.totalPrice?.toFixed(2)}</td>
                  <td>{order.tableNumber}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button className="orders-search-button" onClick={openModal}>
        Search In Orders
      </button>
  
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        content={<SearchOrdersHistoryForm orders={orders}/>}
      />
    </div>
  );
};
