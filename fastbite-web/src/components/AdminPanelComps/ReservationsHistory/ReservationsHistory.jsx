import "./ReservationsHistory.css";
import Modal from "../Modal/Modal";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReservations, fetchUsers } from "../../../redux/reducers/profileSlice";
import { SearchReservationHistoryForm } from "../Forms/SearchReservationHistoryForm/SearchReservationHistoryForm";

export const ReservationsHistory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const reservations = useSelector((state) => state.profile.reservations);
  const users = useSelector((state) => state.profile.users);
  const status = useSelector((state) => state.profile.status);

  useEffect(() => {
    dispatch(fetchReservations());
    dispatch(fetchUsers());
  }, [dispatch]);

  const getUserInfo = (userId) => {
    if (!Array.isArray(users) || users.length === 0) {
      return null;
    }
    return users.find(user => user.id === userId);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (status === 'loading') {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="reservations">
      <h2 className="reservations-title" onClick={openModal}>Reservations</h2>
      <div className="reservations-table-container">
        <table className="reservations-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Date</th>
              <th>Time</th>
              <th>Table</th>
              <th>Guest Count</th>
            </tr>
          </thead>
          <tbody>
            {reservations?.map((reservation, index) => {
              const user = getUserInfo(reservation.userId);
              return (
                <tr key={index}>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button className="reservations-search-button" onClick={openModal}>
        Search In Reservations
      </button>

      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        content={<SearchReservationHistoryForm reservations={reservations} />}
      />
    </div>
  );
};

