import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Modal, Form, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';
 
function AdminDashboard() {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [pendingAdjustments, setPendingAdjustments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const token = localStorage.getItem('token');
  const loggedInAdminId = localStorage.getItem('userId'); // Assuming you store userId in localStorage after login
 
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [requestType, setRequestType] = useState('');
  const [adminComment, setAdminComment] = useState('');
 
  const fetchPendingRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const leavesResponse = await axios.get('http://localhost:8081/api/v1/leaves/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingLeaves(leavesResponse.data);
 
      const adjustmentsResponse = await axios.get('http://localhost:8081/api/v1/attendance/adjustments/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingAdjustments(adjustmentsResponse.data);
 
      const usersResponse = await axios.get('http://localhost:8081/api/v1/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(usersResponse.data);
 
    } catch (err) {
      console.error("Failed to fetch pending requests:", err.response ? err.response.data : err.message);
      setError(`Failed to fetch pending requests: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchPendingRequests();
  }, [token]);
 
  const handleProcessRequest = (request, type) => {
    setCurrentRequest(request);
    setRequestType(type);
    setAdminComment(request.adminComment || '');
    setShowModal(true);
  };
 
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };
 
  const closeDeleteModal = () => {
    setUserToDelete(null);
    setShowDeleteModal(false);
  };
 
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`http://localhost:8081/api/v1/users/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`User ${userToDelete.username} deleted successfully.`);
      setVariant('success');
      fetchPendingRequests(); // Refresh user list
    } catch (err) {
      console.error("Failed to delete user:", err.response ? err.response.data : err.message);
      setMessage(`Failed to delete user: ${err.response?.data?.message || err.message}`);
      setVariant('danger');
    } finally {
      closeDeleteModal();
    }
  };
 
  const submitProcessRequest = async (status) => {
    setMessage('');
    try {
      let endpoint = '';
      // Ensure the logged-in admin cannot process their own requests
      if (currentRequest && currentRequest.user.id === parseInt(loggedInAdminId)) {
        setMessage('You cannot process your own requests.');
        setVariant('danger');
        setShowModal(false);
        return;
      }
 
      if (requestType === 'leave') {
        endpoint = `http://localhost:8081/api/v1/leaves/${currentRequest.id}?status=${status}&adminComment=${encodeURIComponent(adminComment)}`;
      } else if (requestType === 'adjustment') {
        const action = status === 'APPROVED' ? 'approve' : 'reject';
        endpoint = `http://localhost:8081/api/v1/attendance/adjustments/${currentRequest.id}/${action}`;
      }
     
      await axios.put(endpoint, {}, { // Empty payload for PUT with query parameters
        headers: { Authorization: `Bearer ${token}` },
      });
 
      setMessage(`${requestType.charAt(0).toUpperCase() + requestType.slice(1)} request ${status.toLowerCase()} successfully!`);
      setVariant('success');
      setShowModal(false);
      fetchPendingRequests();
    } catch (err) {
      console.error(`Failed to process ${requestType} request:`, err.response ? err.response.data : err.message);
      setMessage(`Failed to process request: ${err.response?.data?.message || err.message}`);
      setVariant('danger');
    }
  };
 
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="dark">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading Admin Dashboard...</p>
      </Container>
    );
  }
 
  const getModalTitle = () => {
    if (!currentRequest) return 'Process Request';
    const typeText = requestType.charAt(0).toUpperCase() + requestType.slice(1);
    return `Process ${typeText} for ${currentRequest.user?.firstName || 'User'}`;
  };
 
  return (
    <Container className="py-4 text-black">
      <h2 className="mb-4 text-center display-6">Admin Dashboard</h2>
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {message && <Alert variant={variant || 'info'} onClose={() => setMessage('')} dismissible>{message}</Alert>}
 
      <Row>
        <Col md={6} className="mb-4 mb-md-0">
          <Card className="shadow-sm h-100">
            <Card.Header as="h5" className="bg-dark text-white">Pending Leave Requests ({pendingLeaves.length})</Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {pendingLeaves.length > 0 ? (
                <ListGroup variant="flush">
                  {pendingLeaves.map((leave) => (
                    <ListGroup.Item key={leave.id} className="px-0 py-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{leave.user.firstName} {leave.user.lastName}</strong> ({leave.user.username})<br />
                          <small className="text-muted">{leave.startDate} to {leave.endDate} ({leave.numberOfDays} days)</small>
                        </div>
                        <Badge pill bg="warning" text="dark">{leave.status}</Badge>
                      </div>
                      <p className="mt-2 mb-2"><em>Reason:</em> {leave.reason}</p>
                      {leave.adminComment && <p className="mt-1 mb-2 text-muted small"><em>Admin note:</em> {leave.adminComment}</p>}
                      <div className="mt-2">
                        {/* Conditional rendering for process button */}
                        {leave.user.id !== parseInt(loggedInAdminId) ? (
                          <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleProcessRequest(leave, 'leave')}>Process</Button>
                        ) : (
                          <Button variant="secondary" size="sm" disabled>Cannot process your own request</Button>
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-center text-muted mt-3">No pending leave requests.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
 
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header as="h5" className="bg-dark text-white">Pending Attendance Adjustments ({pendingAdjustments.length})</Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {pendingAdjustments.length > 0 ? (
                <ListGroup variant="flush">
                  {pendingAdjustments.map((adj) => (
                    <ListGroup.Item key={adj.id} className="px-0 py-3">
                       <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{adj.user.firstName} {adj.user.lastName}</strong> ({adj.user.username})<br />
                           <small className="text-muted">
                             In: {new Date(adj.requestedCheckIn).toLocaleString()} <br/>
                             Out: {new Date(adj.requestedCheckOut).toLocaleString()}
                           </small>
                        </div>
                        <Badge pill bg="warning" text="dark">{adj.status}</Badge>
                      </div>
                      <p className="mt-2 mb-2"><em>Reason:</em> {adj.reason}</p>
                      {adj.adminComment && <p className="mt-1 mb-2 text-muted small"><em>Admin note:</em> {adj.adminComment}</p>}
                      <div className="mt-2">
                          {/* Conditional rendering for process button */}
                          {adj.user.id !== parseInt(loggedInAdminId) ? (
                            <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleProcessRequest(adj, 'adjustment')}>Process</Button>
                          ) : (
                            <Button variant="secondary" size="sm" disabled>Cannot process your own request</Button>
                          )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-center text-muted mt-3">No pending attendance adjustment requests.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
 
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header as="h5" className="bg-dark text-white">Registered Users ({users.length})</Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {users.length > 0 ? (
                <ListGroup variant="flush">
                  {users.map((user) => (
                    <ListGroup.Item key={user.id} className="px-0 py-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{user.firstName} {user.lastName}</strong> ({user.username})<br />
                          <small className="text-muted">{user.email}</small>
                        </div>
                        <div>
                          <Badge pill bg={user.role === 'ADMIN' ? 'primary' : 'secondary'}>{user.role}</Badge>
                          <Link to={`/user-stats/${user.id}`}>
                            <Button variant="outline-info" size="sm" className="ms-2">View Stats</Button>
                          </Link>
                          <Link to={`/profile/${user.id}`}>
                            <Button variant="outline-primary" size="sm" className="ms-2">View Profile</Button>
                          </Link>
                          {/* Prevent admin from deleting themselves */}
                          {user.id !== parseInt(loggedInAdminId) && (
                            <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => openDeleteModal(user)}>
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-center text-muted mt-3">No registered users found.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
 
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{getModalTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-black">
          {currentRequest && (
            <>
              <p>Review the details and add an optional comment before processing.</p>
              {requestType === 'leave' && (
                <Card bg="light" className="p-2 mb-3">
                  <small><strong>Employee:</strong> {currentRequest.user?.firstName} {currentRequest.user?.lastName}</small><br/>
                  <small><strong>Dates:</strong> {currentRequest.startDate} to {currentRequest.endDate}</small><br/>
                  <small><strong>Reason:</strong> {currentRequest.reason}</small>
                </Card>
              )}
              {requestType === 'adjustment' && (
                  <Card bg="light" className="p-2 mb-3">
                    <small><strong>Employee:</strong> {currentRequest.user?.firstName} {currentRequest.user?.lastName}</small><br/>
                    <small><strong>Requested Check-in:</strong> {new Date(currentRequest.requestedCheckIn).toLocaleString()}</small><br/>
                    <small><strong>Requested Check-out:</strong> {new Date(currentRequest.requestedCheckOut).toLocaleString()}</small><br/>
                    <small><strong>Reason:</strong> {currentRequest.reason}</small>
                  </Card>
              )}
              <Form.Group>
                <Form.Label>Admin Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Optional: Provide a reason or comment for the decision."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          {/* Disable or hide buttons in modal if currentRequest user is loggedInAdmin */}
          {currentRequest && currentRequest.user.id !== parseInt(loggedInAdminId) ? (
            <>
              <Button variant="danger" onClick={() => submitProcessRequest('REJECTED')} className="me-2">
                Reject
              </Button>
              <Button variant="success" onClick={() => submitProcessRequest('APPROVED')}>
                Approve
              </Button>
            </>
          ) : (
            <span className="text-muted">You cannot process your own request.</span>
          )}
        </Modal.Footer>
      </Modal>
 
      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the user <strong>{userToDelete?.username}</strong>?</p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
 
export default AdminDashboard;