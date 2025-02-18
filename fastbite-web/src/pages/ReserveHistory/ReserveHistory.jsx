import { useTranslation } from 'react-i18next';
import "./ReserveHistory.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReservations } from "../../redux/reducers/profileSlice";

export const ReserveHistory = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const reservations = useSelector((state) => state.profile.reservations || []);
  const loading = useSelector((state) => state.profile.reservationStatus === "loading");
  const error = useSelector((state) => state.profile.reservationError);

  const [expandedReservationIndex, setExpandedReservationIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedReservationIndex(
      expandedReservationIndex === index ? null : index
    );
  };

  useEffect(() => {
    dispatch(fetchReservations());
  }, [dispatch]);

  return (
    <div className="ReserveHistory">
      <div className="ReserveHistory__left-side">
        <div className="ReserveHistory__background"></div>
        <div></div>
        <div className='ReserveHistory__headers'>
        <span className="ReserveHistory__left-top">
          {t('reserveHistory.title.top')}
        </span>
        <span className="ReserveHistory__left-bot">
          {t('reserveHistory.title.bottom')}
        </span>
        </div>


        <Navbar />
      </div>

      <div className="ReserveHistory__right-side">
        <h2 className="ReserveHistory__title">
          {t('reserveHistory.title.main')}
        </h2>

        {loading && <p>{t('reserveHistory.status.loading')}</p>}
        {error && <p className="ReserveHistory__error">
          {t('reserveHistory.status.error', { message: error })}
        </p>}
        {!loading && !error && (
          <table className="ReserveHistory__table">
            <thead>
              <tr>
                <th></th>
                <th>{t('reserveHistory.table.date')}</th>
                <th>{t('reserveHistory.table.start')}</th>
                <th>{t('reserveHistory.table.end')}</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation, index) => (
                <>
                  <tr
                    key={reservation.id}
                    onClick={() => toggleExpand(index)}
                    className="ReserveHistory__row"
                  >
                    <td>{expandedReservationIndex === index ? "▼" : "▶"}</td>
                    <td>{reservation.reservationDate}</td>
                    <td>{reservation.reservationStartTime}</td>
                    <td>{reservation.reservationEndTime}</td>
                  </tr>

                  {expandedReservationIndex === index && (
                    <tr className="ReserveHistory__details">
                      <td colSpan="4">
                        <table className="ReserveHistory__details-table">
                          <tbody>
                            <tr>
                              <td>
                                <strong>{t('reserveHistory.table.guests')}:</strong> {reservation.guestCount}
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <strong>{t('reserveHistory.table.table')}:</strong> {reservation.tableNumber}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};