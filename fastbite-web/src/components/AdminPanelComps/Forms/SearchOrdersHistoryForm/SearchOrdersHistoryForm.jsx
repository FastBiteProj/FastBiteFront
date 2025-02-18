import { useState } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./SearchOrdersHistoryForm.css";
import { useSelector, useDispatch } from 'react-redux';
import { updateOrder, deleteOrder } from "../../../../redux/reducers/orderSlice";

export const SearchOrdersHistoryForm = ({ orders }) => {
  const dispatch = useDispatch();
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const users = useSelector((state) => state.profile.users);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editedOrder, setEditedOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

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
      tableNumber: order.tableNumber.toString()
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

      const tableNumber = parseInt(editedOrder.tableNumber);
      if (isNaN(tableNumber)) {
        throw new Error('Invalid table number');
      }

      await dispatch(updateOrder({
        orderId: editedOrder.id,
        tableNumber: tableNumber
      })).unwrap();

      const updatedOrders = filteredOrders.map((order) =>
        order.id === editedOrder.id 
          ? { ...order, tableNumber: tableNumber }
          : order
      );

      setFilteredOrders(updatedOrders);
      setEditingOrder(null);
      window.alert("Table number updated successfully.");
    } catch (error) {
      console.error('Update error:', error);
    }
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

  const handleSearch = () => {
    setCurrentPage(1);
    const filtered = orders.filter(order => {
      const user = getUserInfo(order.userId);
      const fullName = user ? `${user.firstName} ${user.lastName}` : '';
      
      const nameMatch = !customerName || 
        fullName.toLowerCase().includes(customerName.toLowerCase());
      
      const dateMatch = !date || order.confirmationDate.includes(date);
      
      return nameMatch && dateMatch;
    });
    
    setFilteredOrders(filtered);
  };

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

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getCurrentOrders = () => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    return filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="search-orders-form">
      <h3>Search Orders</h3>
      <div className="search-inputs">
        <input
          type="text"
          placeholder="Customer name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Date (DD/MM/YY)"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>

      <div className="search-results">
        <table className="search-table">
          <thead>
            <tr>
              <th></th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Table</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentOrders().map((order) => {
              const user = getUserInfo(order.userId);
              return (
                <>
                  <tr key={order.id} className={expandedOrder === order.id ? 'expanded-row' : ''}>
                    <td>
                      <button 
                        className="expand-button"
                        onClick={() => toggleOrderDetails(order.id)}
                      >
                        {expandedOrder === order.id ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </td>
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
                    <td>
                      {editingOrder === order ? (
                        <input
                          type="number"
                          name="tableNumber"
                          value={editedOrder.tableNumber}
                          onChange={handleEditInputChange}
                          className="edit-input"
                          min="0"
                        />
                      ) : (
                        order.tableNumber
                      )}
                    </td>
                    <td>
                      {editingOrder === order ? (
                        <>
                          <FaCheck className="action-icon save-icon" onClick={saveEdit} />
                          <FaTimes 
                            className="action-icon cancel-icon" 
                            onClick={() => setEditingOrder(null)} 
                          />
                        </>
                      ) : (
                        <>
                          <FaEdit
                            className="action-icon edit-icon"
                            onClick={() => handleEdit(order)}
                          />
                          <FaTrash
                            className="action-icon delete-icon"
                            onClick={() => handleDelete(order)}
                          />
                        </>
                      )}
                    </td>
                  </tr>
                  {expandedOrder === order.id && (
                    <tr className="order-details-row">
                      <td colSpan="7">
                        <div className="order-details">
                          <h4>Order Details</h4>
                          <table className="products-table">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.productNames?.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.productName}</td>
                                  <td>{item.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }).map((_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={currentPage === index + 1 ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
