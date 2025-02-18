import "./ProfilePage.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import {
  fetchUserProfile,
  updateUserProfile,
} from "../../redux/reducers/profileSlice";
import { LogoutModal } from "../../components/LogoutModal/LogoutModal";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, status, error } = useSelector((state) => state.profile);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
 
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSave = () => {
    dispatch(updateUserProfile(formData));
    setIsEditing(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="ProfilePage">
      <div className="ProfilePage__left-side">
        <div className="ProfilePage__background"></div>
        <div></div>
        <div className="ProfilePage__headers">
          <span className="ProfilePage__left-top">
            {t("profile.title.top")}
          </span>
          <span className="ProfilePage__left-bot">
            {t("profile.title.bottom")}
          </span>
        </div>

        <Navbar />
      </div>

      <div className="ProfilePage__right-side">
        <h2 className="ProfilePage__title">{t("profile.title.full")}</h2>

        {status === "loading" ? (
          <p>{t("profile.loading")}</p>
        ) : error ? (
          <p>{t("profile.error", { message: error })}</p>
        ) : (
          <div className="ProfilePage__info">
            <div className="ProfilePage-item-group">
              <div className="ProfilePage-item">
                <span className="ProfilePage__item-title">
                  {t("profile.fields.firstName")}
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="ProfilePage__input"
                  />
                ) : (
                  <span className="ProfilePage__item-info">
                    {user?.firstName}
                  </span>
                )}
              </div>
              <div className="ProfilePage-item">
                <span className="ProfilePage__item-title">
                  {t("profile.fields.lastName")}
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="ProfilePage__input"
                  />
                ) : (
                  <span className="ProfilePage__item-info">
                    {user?.lastName}
                  </span>
                )}
              </div>
            </div>

            <div className="ProfilePage-item">
              <span className="ProfilePage__item-title">
                {t("profile.fields.email")}
              </span>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="ProfilePage__input"
                />
              ) : (
                <span className="ProfilePage__item-info">{user?.email}</span>
              )}
            </div>

            <div className="ProfilePage-item">
              <span className="ProfilePage__item-title">
                {t("profile.fields.phoneNumber")}
              </span>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="ProfilePage__input"
                />
              ) : (
                <span className="ProfilePage__item-info">
                  {user?.phoneNumber}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="ProfilePage__buttons">
          {isEditing ? (
            <button className="ProfilePage__save-button" onClick={handleSave}>
              {t("profile.buttons.save")}
            </button>
          ) : (
            <div className="ProfilePage__edit-exit">
              <button
                className="ProfilePage__edit-button"
                onClick={() => setIsEditing(true)}
              >
                {t("profile.buttons.edit")}
              </button>
              <button
                className="ProfilePage__exit-button exit"
                onClick={openModal}
              >
                {t("profile.buttons.signOut")}
              </button>
            </div>
          )}
        </div>
        <div className="ProfilePage__extra-buttons">
          <Link to="/reserve-history">
            <button className="ProfilePage__navigation-button">
              {t("profile.buttons.reservationsHistory")}
            </button>
          </Link>
          <Link to="/orders-history">
            <button className="ProfilePage__navigation-button">
              {t("profile.buttons.ordersHistory")}
            </button>
          </Link>
        </div>
      </div>

      {isModalOpen && <LogoutModal closeModal={closeModal} />}
    </div>
  );
};
