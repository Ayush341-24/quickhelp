import React, { useState } from 'react';

const UrgentBookingChatbot = () => {
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUrgencyDetection = () => {
    setIsUrgent(true);
  };

  const handleAutoBook = async () => {
    setIsLoading(true);
    // Logic to trigger chatbot confirmation
    await triggerChatbotConfirmation();
    // Logic to send email with bill
    await sendEmailWithBill();
    setIsLoading(false);
  };

  const triggerChatbotConfirmation = async () => {
    // Placeholder for chatbot confirmation logic
    console.log('Chatbot confirmation triggered.');
  };

  const sendEmailWithBill = async () => {
    // Placeholder for generating and sending email with bill
    console.log('Email with bill sent.');
  };

  return (
    <div>
      <h1>Urgent Booking</h1>
      {isUrgent ? (
        <div>
          <p>Urgency detected! Would you like to auto-book the urgent service?</p>
          <button onClick={handleAutoBook} disabled={isLoading}>
            {isLoading ? 'Booking...' : 'Yes, Book Now'}
          </button>
        </div>
      ) : (
        <button onClick={handleUrgencyDetection}>Detect Urgency</button>
      )}
    </div>
  );
};

export default UrgentBookingChatbot;