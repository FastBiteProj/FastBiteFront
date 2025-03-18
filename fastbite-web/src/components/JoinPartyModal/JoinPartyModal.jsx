import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { joinParty } from '../../redux/reducers/partySlice';
import './JoinPartyModal.css';

export const JoinPartyModal = ({ userId, onClose, onJoinSuccess }) => {
  const [partyId, setPartyId] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  const handleJoinParty = async () => {
    if (!partyId.trim()) {
      setError('Please enter a party ID');
      return;
    }

    try {
      const result = await dispatch(joinParty({
        partyCode: partyId.trim(),
        userId: userId
      })).unwrap();
      
      onJoinSuccess(partyId.trim());
      onClose();
    } catch (error) {
      setError('Failed to join party. Please check the ID and try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="join-party-modal">
        <h2>Join Party</h2>
        <div className="join-party-content">
          <input
            type="text"
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            placeholder="Enter party ID"
            className="party-code-input"
          />
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="modal-buttons">
          <button 
            className="confirm-button"
            onClick={handleJoinParty}
          >
            Join
          </button>
          <button 
            className="cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}; 