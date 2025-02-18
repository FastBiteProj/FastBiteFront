import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../Modal/Modal";
import "./Users.css";
import { SearchCustomersForm } from "../Forms/SearchCustomersForm/SearchCustomersForm";
import { fetchUsers } from "../../../redux/reducers/profileSlice";

export const Users = () => {
  const dispatch = useDispatch();
  const { users, usersStatus, usersError } = useSelector((state) => state.profile);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (usersStatus === 'loading') {
    return <div>Loading users...</div>;
  }

  if (usersStatus === 'failed') {
    return <div>Error: {usersError}</div>;
  }

  return (
    <div className="users-list">
      <h2 className="users-title" onClick={openModal}>
        Customers List
      </h2>
      <ul className="users-items">
        {users && users.map((user, index) => (
          <li key={user.id || index} className="users-item">
            {user.firstName} {user.lastName}
          </li>
        ))}
      </ul>
      <button className="users-search-button" onClick={openModal}>
        Search In Customers
      </button>

      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        content={<SearchCustomersForm clients={users} />}
      />
    </div>
  );
};
