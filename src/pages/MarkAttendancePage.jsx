import React, { useState } from 'react';
import { Container, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import api from '../api';

function MarkAttendancePage() {
  const token = localStorage.getItem('token');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const logError = (context, errorObj) => {
    console.error(
      `${context} error:`, 
      errorObj.response?.data || errorObj.message || errorObj
    );
  };

  const handleCheckIn = async () => {
    setMessage('');
    setError('');
    try {
      const response = await api.post(
        '/api/v1/attendance/checkin',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('Check-in successful at ' + new Date(response.data.checkInTime).toLocaleTimeString());
      console.log('Check-in response:', response.data);
    } catch (err) {
      let apiErrorMessage = null;
      if (err.response && err.response.data) {
        if (typeof err.response.data.message === 'string') {
          apiErrorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          apiErrorMessage = err.response.data;
        }
      }
      setError(apiErrorMessage || 'Failed to check in. Please try again.');
      logError('Check-in', err);
    }
  };

  const handleCheckOut = async () => {
    setMessage('');
    setError('');
    try {
      const response = await api.put(
        '/api/v1/attendance/checkout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('Check-out successful at ' + new Date(response.data.checkOutTime).toLocaleTimeString());
      console.log('Check-out response:', response.data);
    } catch (err) {
      let apiErrorMessage = null;
      if (err.response && err.response.data) {
        if (typeof err.response.data.message === 'string') {
          apiErrorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          apiErrorMessage = err.response.data;
        }
      }
      setError(apiErrorMessage || 'Failed to check out. Please try again.');
      logError('Check-out', err);
    }
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="shadow-lg border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            <Card.Header className="bg-transparent border-0 text-center py-3">
              <h2 className="text-dark fw-bold mb-0">Mark Your Attendance</h2>
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              {message && <Alert variant="success" className="text-center">{message}</Alert>}
              {error && <Alert variant="danger" className="text-center">{error}</Alert>}
              
              <p className="text-center text-muted mb-4">
                Please check-in when you start your day and check-out when you finish.
              </p>

              <div className="d-grid gap-3">
                <Button 
                  variant="dark" 
                  size="lg" 
                  onClick={handleCheckIn} 
                  className="text-uppercase fw-bold py-3"
                >
                  Check In
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="lg" 
                  onClick={handleCheckOut} 
                  className="text-uppercase fw-bold py-3"
                >
                  Check Out
                </Button>
              </div>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0 text-center text-muted py-3">
              <small>Ensure your attendance is marked accurately for payroll processing.</small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default MarkAttendancePage;