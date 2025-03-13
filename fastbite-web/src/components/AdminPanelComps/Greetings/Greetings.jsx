import "./Greetings.css";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../redux/reducers/authSlice";
import { useNavigate } from "react-router-dom";

export const Greetings = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

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
        <div className="greetings-info">
          <p className="greetings-name">{user.name}</p>
          <p className="greetings-nick">{user.email}</p>

        </div>
        <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
      </div>
    </div>
  );
};