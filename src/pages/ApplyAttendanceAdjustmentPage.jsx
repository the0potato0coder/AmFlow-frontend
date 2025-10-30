import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../api';

function ApplyAttendanceAdjustmentPage() {
  const [requestedCheckIn, setRequestedCheckIn] = useState('');
  const [requestedCheckOut, setRequestedCheckOut] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    if (!requestedCheckIn || !requestedCheckOut || !reason) {
      setMessage('Please fill in all fields.');
      setVariant('danger');
      setLoading(false);
      return;
    }

    // Basic date/time validation
    const checkInDateTime = new Date(requestedCheckIn);
    const checkOutDateTime = new Date(requestedCheckOut);
    const now = new Date();

    if (checkInDateTime >= now || checkOutDateTime >= now) {
      setMessage('Adjustment times cannot be in the future.');
      setVariant('danger');
      setLoading(false);
      return;
    }

    if (checkOutDateTime <= checkInDateTime) {
      setMessage('Requested check-out time must be after requested check-in time.');
      setVariant('danger');
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/v1/attendance/adjustments/request', {
        requestedCheckIn: requestedCheckIn + ':00', // Add seconds if not present
        requestedCheckOut: requestedCheckOut + ':00', // Add seconds if not present
        reason,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Attendance adjustment request submitted successfully!');
      setVariant('success');
      setRequestedCheckIn('');
      setRequestedCheckOut('');
      setReason('');
    } catch (err) {
      console.error("Adjustment request failed:", err.response ? err.response.data : err.message);
      setMessage(`Failed to submit adjustment request: ${err.response?.data?.message || err.message}`);
      setVariant('danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '80vh' }}>
      <div className="p-4 rounded shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: 'black', width: '100%', maxWidth: '500px' }}>
        <h2 className="text-center mb-4 pb-2">Request Attendance Adjustment</h2>
        {message && <Alert variant={variant}>{message}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formRequestedCheckIn">
            <Form.Label>Requested Check-in Time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={requestedCheckIn}
              onChange={(e) => setRequestedCheckIn(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formRequestedCheckOut">
            <Form.Label>Requested Check-out Time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={requestedCheckOut}
              onChange={(e) => setRequestedCheckOut(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formReason">
            <Form.Label>Reason for Adjustment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Explain why you need this adjustment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 btn-dark" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Submit Adjustment Request'}
          </Button>
        </Form>
      </div>
    </Container>
  );
}

export default ApplyAttendanceAdjustmentPage;