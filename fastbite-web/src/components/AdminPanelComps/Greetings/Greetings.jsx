import "./Greetings.css";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../redux/reducers/authSlice";
import { useNavigate } from "react-router-dom";

export const Greetings = () => {
  const user = useSelector((state) => state.auth.user); // Изменено на auth.user
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Добавляем проверку на наличие user
  if (!user) {
    return (
      <div className="greetings">
        <h1 className="greetings-title">Admin Panel</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="greetings">
      <h1 className="greetings-title">Admin Panel</h1>
      <div className="greetings-profile">
        <img
          src="https://via.placeholder.com/100"
          alt="Admin Avatar"
          className="greetings-avatar"
        />
        <div className="greetings-info">
          <p className="greetings-name">{user.name}</p>
          <p className="greetings-nick">@{user.email}</p>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};