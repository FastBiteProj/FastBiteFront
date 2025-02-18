import { useState } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import "./SearchOrdersHistoryForm.css";
import { useSelector, useDispatch } from 'react-redux';
import { updateOrder, deleteOrder } from "../../../../redux/reducers/orderSlice";

export const SearchOrdersForm = ({ orders }) => {
  const dispatch = useDispatch();
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const users = useSelector((state) => state.profile.users);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editedOrder, setEditedOrder] = useState(null);

  const getUserInfo = (userId) => {
    if (!Array.isArray(users) || users.length === 0) {
      return null;
    }
    return users.find(user => user.id === userId);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setEditedOrder({
      ...order,
      totalPrice: order.totalPrice.toString()
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedOrder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveEdit = async () => {
    try {
      if (!editedOrder.id) {
        throw new Error('Order ID is missing');
      }

      const orderData = {
        id: editedOrder.id,
        totalPrice: parseFloat(editedOrder.totalPrice),
        tableNumber: parseInt(editedOrder.tableNumber),
        userId: editedOrder.userId,
        confirmationDate: editedOrder.confirmationDate
      };

      await dispatch(updateOrder({
        orderId: editedOrder.id,
        orderData
      })).unwrap();

      const updatedOrders = filteredOrders.map((order) =>
        order.id === editedOrder.id 
          ? { ...order, ...orderData }
          : order
      );

      setFilteredOrders(updatedOrders);
      setEditingOrder(null);
      window.alert("Order updated successfully.");
    } catch (error) {
      window.alert(`Failed to update order: ${error.message}`);
    }
  };

  const cancelEdit = () => {
    setEditingOrder(null);
    setEditedOrder(null);
  };

  const handleDelete = async (order) => {
    if (window.confirm(`Are you sure you want to delete this order?`)) {
      try {
        await dispatch(deleteOrder(order.id)).unwrap();
        
        const updatedOrders = filteredOrders.filter(
          (o) => o.id !== order.id
        );
        setFilteredOrders(updatedOrders);
        window.alert("Order deleted successfully.");
      } catch (error) {
        window.alert(`Failed to delete order: ${error.message}`);
      }
    }
  };

  // ... остальной код поиска ...

  return (
    <div className="search-orders-form">
      {/* ... существующий код поиска ... */}
      <div className="search-results">
        <table className="search-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Table</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders?.map((order) => {
              const user = getUserInfo(order.userId);
              return (
                <tr key={order.id}>
                  {editingOrder === order ? (
                    <>
                      <td>
                        {user 
                          ? `${user.name} ${user.surname}` 
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
                      <td>
                        <input
                          type="number"
                          name="totalPrice"
                          value={editedOrder.totalPrice}
                          onChange={handleEditInputChange}
                          className="edit-input"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="tableNumber"
                          value={editedOrder.tableNumber}
                          onChange={handleEditInputChange}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <FaCheck className="action-icon save-icon" onClick={saveEdit} />
                        <FaTimes className="action-icon cancel-icon" onClick={cancelEdit} />
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        {user 
                          ? `${user.name} ${user.surname}` 
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
                      <td>
                        <FaEdit
                          className="action-icon"
                          onClick={() => handleEdit(order)}
                        />
                        <FaTrash
                          className="action-icon"
                          onClick={() => handleDelete(order)}
                        />
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 