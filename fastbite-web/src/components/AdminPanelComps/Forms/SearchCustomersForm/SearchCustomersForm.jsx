import { useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { deleteUserByAdmin, updateUserByAdmin } from "../../../../redux/reducers/profileSlice";
import "./SearchCustomersForm.css";

export const SearchCustomersForm = ({ clients }) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClient, setEditingClient] = useState(null);
  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  const filteredClients = clients.filter(
    (client) =>
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (client) => {
    setEditingClient(client);
    setEditedFirstName(client.firstName);
    setEditedLastName(client.lastName);
    setEditedPhone(client.phoneNumber);
    setEditedEmail(client.email);
  };

  const saveEdit = async (client) => {
    try {
      const updateUserDto = {
        firstName: editedFirstName,
        lastName: editedLastName,
        phoneNumber: editedPhone,
        email: editedEmail
      };

      await dispatch(updateUserByAdmin({ 
        userId: client.id, 
        updateUserDto 
      })).unwrap();

      window.alert(
        `Customer ${client.firstName} ${client.lastName} was successfully updated!`
      );
      
      setEditingClient(null);
      setEditedFirstName("");
      setEditedLastName("");
      setEditedPhone("");
      setEditedEmail("");
    } catch (error) {
      window.alert(`Failed to update user: ${error}`);
    }
  };

  const cancelEdit = () => {
    setEditingClient(null);
    setEditedFirstName("");
    setEditedLastName("");
    setEditedPhone("");
    setEditedEmail("");
  };

  const handleDelete = async (client) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${client.firstName} ${client.lastName}?`
      )
    ) {
      try {
        await dispatch(deleteUserByAdmin(client.id)).unwrap();
        window.alert(`User ${client.firstName} ${client.lastName} was successfully deleted!`);
      } catch (error) {
        window.alert(`Failed to delete user: ${error}`);
      }
    }
  };

  return (
    <div className="search-customers-form">
      <h3 className="modal-title">Manage Customers</h3>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="users-search-input"
      />
      <div className="filtered-users">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div key={client.id} className="filtered-user">
              {editingClient === client ? (
                <div className="edit-container">
                  <input
                    type="text"
                    value={editedFirstName}
                    onChange={(e) => setEditedFirstName(e.target.value)}
                    className="edit-input"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    value={editedLastName}
                    onChange={(e) => setEditedLastName(e.target.value)}
                    className="edit-input"
                    placeholder="Last Name"
                  />
                  <input
                    type="tel"
                    value={editedPhone}
                    onChange={(e) => setEditedPhone(e.target.value)}
                    className="edit-input"
                    placeholder="Phone Number"
                  />
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="edit-input"
                    placeholder="Email"
                  />
                  <FaCheck
                    className="user-actions-icon-edit save-icon"
                    title="Save"
                    onClick={() => saveEdit(client)}
                  />
                  <FaTimes
                    className="user-actions-icon-edit cancel-icon"
                    title="Cancel"
                    onClick={cancelEdit}
                  />
                </div>
              ) : (
                <div className="users-default">
                  <div className="user-info">
                    <span className="user-name">
                      {client.firstName} {client.lastName}
                    </span>
                    <span className="user-details">
                      {client.email} | {client.phoneNumber}
                    </span>
                  </div>
                  <div className="user-actions">
                    <FaEdit
                      className="user-actions-icon"
                      title="Edit"
                      onClick={() => handleEdit(client)}
                    />
                    <FaTrash
                      className="user-actions-icon"
                      title="Delete"
                      onClick={() => handleDelete(client)}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No customers found.</p>
        )}
      </div>
    </div>
  );
};

SearchCustomersForm.propTypes = {
  clients: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      phoneNumber: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      accessToken: PropTypes.string
    })
  ).isRequired,
};
