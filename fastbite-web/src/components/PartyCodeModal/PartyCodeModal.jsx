import React, { useEffect, useState } from 'react';
import './PartyCodeModal.css';
import { useDispatch } from 'react-redux';
import { getParty, leaveParty } from '../../redux/reducers/partySlice';

export const PartyCodeModal = ({ partyId, userId, onClose, onLeave }) => {
  const dispatch = useDispatch();
  const [partyData, setPartyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPartyData = async () => {
      try {
        const result = await dispatch(getParty(partyId)).unwrap();
        setPartyData(result);
      } catch (error) {
        setError('Failed to load party information');
        console.error('Error fetching party data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (partyId) {
      fetchPartyData();
    }
  }, [dispatch, partyId]);

  const handleCopyPartyCode = () => {
    if (partyData?.partyCode) {
      navigator.clipboard.writeText(partyData.partyCode)
        .then(() => alert('Party code copied to clipboard!'))
        .catch(err => console.error('Failed to copy code:', err));
    }
  };

  const handleLeaveParty = async () => {
    try {
      await dispatch(leaveParty({ partyId, userId })).unwrap();
      onLeave();
      onClose();
    } catch (error) {
      console.error('Error leaving party:', error);
      alert('Failed to leave party');
    }
  };

  if (loading) {
    return (
      <div className="party-modal-overlay">
        <div className="party-modal-content">
          <h2>Loading party information...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="party-modal-overlay">
        <div className="party-modal-content">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="party-close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="party-modal-overlay">
      <div className="party-modal-content">
        <h2>Party Information</h2>
        
        {partyData && (
          <>
            <div className="party-info-section">
              <div className="party-code" onClick={handleCopyPartyCode}>
                <label>Party Code:</label>
                <span>{partyData.partyId}</span>
                <div className="party-copy-hint">Click to copy</div>
              </div>

              <div className="party-details">
                <div className="party-detail-item">
                  <label>Table Number:</label>
                  <span>{partyData.tableId}</span>
                </div>

                <div className="party-detail-item">
                  <label>Members:</label>
                  <span>{partyData.memberIds.length}</span>
                </div>
              </div>

              {partyData.orderItems.length > 0 && (
                <div className="party-orders">
                  <h3>Order Items</h3>
                  <div className="party-order-items-list">
                    {partyData.orderItems.map((item, index) => (
                      <div key={index} className="party-order-item">
                        <span>{item.productName}</span>
                        <span>Quantity: {item.quantity}</span>
                        <span>Price: ${item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="party-modal-buttons">
              <button className="party-leave-button" onClick={handleLeaveParty}>
                Leave Party
              </button>
              <button className="party-close-button" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 