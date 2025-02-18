import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './CreateReservationForm.css';
import { fetchTables, createReservation } from '../../../../redux/reducers/reservationSlice';

export const CreateReservationForm = ({ closeModal }) => {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.reservation.tables);
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    reservationStartTime: '',
    reservationEndTime: '',
    reservationDate: '',
    guestCount: 1,
    tableNumber: '',
    userId: user?.id || '',
    order: null
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    dispatch(fetchTables(today));
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createReservation(formData)).unwrap();
      closeModal();
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  return (
    <form className="create-reservation-form" onSubmit={handleSubmit}>
      <h2>Create New Reservation</h2>
      
      <div className="form-group">
        <label htmlFor="tableNumber">Table:</label>
        <select
          id="tableNumber"
          name="tableNumber"
          value={formData.tableNumber}
          onChange={handleChange}
          required
        >
          <option value="">Select a table</option>
          {tables.map((table) => (
            <option key={table.id} value={table.tableNumber}>
              Table {table.tableNumber}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="reservationDate">Date:</label>
        <input
          type="date"
          id="reservationDate"
          name="reservationDate"
          value={formData.reservationDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="reservationStartTime">Start Time:</label>
        <input
          type="time"
          id="reservationStartTime"
          name="reservationStartTime"
          value={formData.reservationStartTime}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="reservationEndTime">End Time:</label>
        <input
          type="time"
          id="reservationEndTime"
          name="reservationEndTime"
          value={formData.reservationEndTime}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="guestCount">Number of Guests:</label>
        <input
          type="number"
          id="guestCount"
          name="guestCount"
          value={formData.guestCount}
          onChange={handleChange}
          required
          min="1"
        />
      </div>

      <div className="form-buttons">
        <button type="submit" className="submit-btn">Create Reservation</button>
        <button type="button" className="cancel-btn" onClick={closeModal}>
          Cancel
        </button>
      </div>
    </form>
  );
};