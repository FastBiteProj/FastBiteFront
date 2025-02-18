import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import "./SearchReservationHistoryForm.css";
import { useSelector, useDispatch } from "react-redux";
import { updateReservation, deleteReservation } from "../../../../redux/reducers/reservationSlice";
import { fetchUsers } from "../../../../redux/reducers/profileSlice";

export const SearchReservationHistoryForm = ({ reservations }) => {
  const dispatch = useDispatch();
  const [searchResults, setSearchResults] = useState(reservations || []);
  const [searchCriteria, setSearchCriteria] = useState({
    name: "",
    date: "",
  });
  const users = useSelector((state) => state.profile.users);
  const [editingReservation, setEditingReservation] = useState(null);
  const [editedReservation, setEditedReservation] = useState({
    id: null,
    displayData: {
      reservationDate: '',
      reservationStartTime: '',
      reservationEndTime: ''
    },
    reservationData: {
      reservationDate: '',
      reservationStartTime: '',
      reservationEndTime: '',
      tableNumber: '',
      guestCount: '',
      userId: ''
    }
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const getUserInfo = (userId) => {
    if (!Array.isArray(users) || users.length === 0) {
      console.log('Users array:', users);
      return null;
    }
    const user = users.find(user => user.id === userId);
    console.log('Found user for ID:', userId, user);
    return user;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const { name, date } = searchCriteria;

    const filtered = reservations.filter((reservation) => {
      const user = getUserInfo(reservation.userId);
      const userName = user ? `${user.firstName} ${user.lastName}` : '';
      
      return (!name || userName.toLowerCase().includes(name.toLowerCase())) &&
             (!date || reservation.reservationDate.includes(date));
    });

    setSearchResults(filtered);
  };

  const handleEdit = (reservation) => {
    const [day, month, year] = reservation.reservationDate.split('/');
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    const formatTimeForInput = (timeStr) => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      
      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:${minutes}`;
    };

    const formattedStartTime = formatTimeForInput(reservation.reservationStartTime);
    const formattedEndTime = formatTimeForInput(reservation.reservationEndTime);

    setEditingReservation(reservation);
    setEditedReservation({
      id: reservation.id,
      displayData: {
        reservationDate: reservation.reservationDate,
        reservationStartTime: reservation.reservationStartTime,
        reservationEndTime: reservation.reservationEndTime
      },
      reservationData: {
        reservationDate: formattedDate,
        reservationStartTime: formattedStartTime,
        reservationEndTime: formattedEndTime,
        tableNumber: reservation.tableNumber,
        guestCount: reservation.guestCount,
        userId: reservation.userId
      }
    });
  };

  const saveEdit = async () => {
    try {
      if (!editedReservation.id) {
        throw new Error('Reservation ID is missing');
      }

      const formatDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
        return `${month}/${day}/${year}`;
      };

      const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':');
        let hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12;
        
        return `${hour}:${minutes} ${period}`;
      };

      const reservationData = {
        id: editedReservation.id,
        reservationDate: formatDate(editedReservation.reservationData.reservationDate),
        reservationStartTime: formatTime(editedReservation.reservationData.reservationStartTime),
        reservationEndTime: formatTime(editedReservation.reservationData.reservationEndTime),
        tableNumber: parseInt(editedReservation.reservationData.tableNumber),
        guestCount: parseInt(editedReservation.reservationData.guestCount),
        userId: editedReservation.reservationData.userId,
        order: null
      };

      console.log('Sending updated data:', reservationData);

      await dispatch(updateReservation({
        reservationId: editedReservation.id,
        reservationData
      })).unwrap();

      const updatedReservations = searchResults.map((reservation) =>
        reservation.id === editedReservation.id 
          ? { ...reservation, ...reservationData }
          : reservation
      );

      setSearchResults(updatedReservations);
      setEditingReservation(null);
      window.alert("Reservation updated successfully.");
    } catch (error) {
      window.alert(`Failed to update reservation: ${error.message}`);
    }
  };

  const cancelEdit = () => {
    setEditingReservation(null);
    setEditedReservation({
      id: null,
      displayData: {
        reservationDate: '',
        reservationStartTime: '',
        reservationEndTime: ''
      },
      reservationData: {
        reservationDate: '',
        reservationStartTime: '',
        reservationEndTime: '',
        tableNumber: '',
        guestCount: '',
        userId: ''
      }
    });
  };

  const handleDelete = async (reservation) => {
    if (window.confirm(`Are you sure you want to delete this reservation?`)) {
      try {
        await dispatch(deleteReservation(reservation.id)).unwrap();
        
        const updatedReservations = searchResults.filter(
          (r) => r.id !== reservation.id
        );
        setSearchResults(updatedReservations);
        window.alert("Reservation deleted successfully.");
      } catch (error) {
        window.alert(`Failed to delete reservation: ${error.message}`);
      }
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedReservation(prev => ({
      ...prev,
      reservationData: {
        ...prev.reservationData,
        [name]: value
      }
    }));
  };

  return (
    <div className="search-reservation-form">
      <h3>Search Reservations</h3>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          name="name"
          placeholder="Customer name"
          value={searchCriteria.firstName}
          onChange={handleInputChange}
          className="search-input"
        />
        <input
          type="text"
          name="date"
          placeholder="Date (DD/MM/YY)"
          value={searchCriteria.date}
          onChange={handleInputChange}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
      <div className="results-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Date</th>
              <th>Time</th>
              <th>Table</th>
              <th>Guest Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((reservation, index) => {
              const user = getUserInfo(reservation.userId);
              return (
                <tr key={index}>
                  {editingReservation === reservation ? (
                    <>
                      <td>
                        {user 
                          ? `${user.firstName} ${user.lastName} (${user.phoneNumber})` 
                          : `Unknown User (ID: ${reservation.userId})`
                        }
                      </td>
                      <td>
                        <input
                          type="date"
                          name="reservationDate"
                          value={editedReservation?.reservationData?.reservationDate || ''}
                          onChange={handleEditInputChange}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input
                            type="time"
                            name="reservationStartTime"
                            value={editedReservation?.reservationData?.reservationStartTime || ''}
                            onChange={handleEditInputChange}
                            className="edit-input"
                          />
                          <input
                            type="time"
                            name="reservationEndTime"
                            value={editedReservation?.reservationData?.reservationEndTime || ''}
                            onChange={handleEditInputChange}
                            className="edit-input"
                          />
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          name="tableNumber"
                          value={editedReservation?.reservationData?.tableNumber || ''}
                          onChange={handleEditInputChange}
                          className="edit-input"
                        />
                      </td>
                      <td>{reservation.guestCount}</td>
                      <td>
                        <FaCheck className="action-icon save-icon" onClick={saveEdit} />
                        <FaTimes className="action-icon cancel-icon" onClick={cancelEdit} />
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        {user 
                          ? `${user.firstName} ${user.lastName} (${user.phoneNumber})` 
                          : `Unknown User (ID: ${reservation.userId})`
                        }
                      </td>
                      <td>{reservation.reservationDate}</td>
                      <td>{`${reservation.reservationStartTime} - ${reservation.reservationEndTime}`}</td>
                      <td>{reservation.tableNumber}</td>
                      <td>{reservation.guestCount}</td>
                      <td>
                        <FaEdit
                          className="action-icon"
                          onClick={() => handleEdit(reservation)}
                        />
                        <FaTrash
                          className="action-icon"
                          onClick={() => handleDelete(reservation)}
                        />
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {searchResults.length === 0 && (
          <p className="no-results">No reservations found</p>
        )}
      </div>
    </div>
  );
};
