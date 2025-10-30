import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Alert, Card, Row, Col } from 'react-bootstrap';
import api from '../api';

function LoginPage({ onAuthChange }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true); // Start loading

    
    try {
    
      const response = await api.post('/api/v1/auth/authenticate', {
        username,
        password  
      });

      // Assuming the backend returns a 'token' property in the response data
      const { token } = response.data;

      // After successful authentication, fetch user details using the new JWT
      // This step is crucial because the /authenticate endpoint only returns the token.
      // We need user role and ID to store in localStorage for routing and display.
      const userDetailsResponse = await api.get('/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const user = userDetailsResponse.data; // Get user details from the /users/me endpoint

      localStorage.setItem('token', token); // Store the JWT token
      localStorage.setItem('username', user.username);
      localStorage.setItem('userId', user.id.toString());
      localStorage.setItem('role', user.role); // Store the user's role

      onAuthChange(true, user.role); // Update App.js state

      if (user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/employee-dashboard'); // Default for EMPLOYEE
      }

    } catch (err) {
      console.error("Login failed:", err.response ? err.response.data : err.message);
      let errorMessage = 'Invalid username or password. Please try again.';
      // if (err.response && err.response.data && err.response.data.message) {
      //   // If the backend sends a specific error message, use it
      //   errorMessage = err.response.data.message;
      // }
      setError(errorMessage);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={6} lg={4}>
          <Card className="shadow-lg border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <Card.Body className="p-4 p-md-5">
              <h2 className="text-center text-dark fw-bold mb-4">Login to Amflow</h2>
              {error && <Alert variant="danger" className="text-center">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Label className="text-dark">Username</Form.Label>
                  <Form.Control type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label className="text-dark">Password</Form.Label>
                  <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </Form.Group>
                <Button variant="dark" type="submit" className="w-100 text-uppercase fw-bold py-2 mb-3" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging In...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Form>
              {/* <div className="text-center">
                <span className="text-muted">Don't have an account? </span>
                <Link to="/register" className="fw-bold text-decoration-none">Sign up</Link>
              </div> */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;