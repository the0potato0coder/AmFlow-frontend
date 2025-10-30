import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Alert, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';

function RegistrationPage() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Basic validation for mobile number (10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      setError('Mobile number must be 10 digits.');
      return;
    }

    try {
      await axios.post('http://localhost:8081/api/v1/users/register', {
        username,
        firstName,
        lastName,
        email,
        mobile: parseInt(mobile, 10), // Ensure mobile is sent as a number
        password,
        role: role
      });
      setSuccess('User registered successfully!');
      // Reset form fields
      setUsername('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setMobile('');
      setPassword('');
      setConfirmPassword('');
      setRole('EMPLOYEE');
    } catch (err) {
      console.error("Registration failed:", err.response ? err.response.data : err.message);
      if (err.response && err.response.status === 409) {
        setError('Username or email might already be taken.');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-lg border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <Card.Body className="p-4 p-md-5">
              <h2 className="text-center text-dark fw-bold mb-4">Register a New User</h2>
              {error && <Alert variant="danger" className="text-center">{error}</Alert>}
              {success && <Alert variant="success" className="text-center">{success}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formBasicFirstName">
                      <Form.Label className="text-dark">First Name</Form.Label>
                      <Form.Control type="text" placeholder="Enter first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formBasicLastName">
                      <Form.Label className="text-dark">Last Name</Form.Label>
                      <Form.Control type="text" placeholder="Enter last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Label className="text-dark">Username</Form.Label>
                  <Form.Control type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="text-dark">Email address</Form.Label>
                  <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicMobile">
                  <Form.Label className="text-dark">Mobile Number</Form.Label>
                  <Form.Control type="tel" placeholder="Enter 10-digit mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} required pattern="\d{10}" maxLength={10} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicRole">
                  <Form.Label className="text-dark">Role</Form.Label>
                  <Form.Select value={role} onChange={(e) => setRole(e.target.value)} required>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Admin</option>
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                      <Form.Label className="text-dark">Password</Form.Label>
                      <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="formBasicConfirmPassword">
                      <Form.Label className="text-dark">Confirm Password</Form.Label>
                      <Form.Control type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </Form.Group>
                  </Col>
                </Row>

                <Button variant="dark" type="submit" className="w-100 text-uppercase fw-bold py-2 mb-3">
                  Register
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RegistrationPage;