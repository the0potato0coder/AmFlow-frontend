import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Form, Alert, Image, ListGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import api from '../api'; // <-- 1. IMPORT YOUR API FILE

// Predefined list of background colors for avatars
const avatarColors = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
  '#FF5722', '#795548', '#9E9E9E', '#607D8B'
];

// Helper function to get a consistent color based on a name
const getAvatarColor = (name) => {
  if (!name) return avatarColors[0]; // Default color if name is undefined
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: ''
  });
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const { userId } = useParams();
  const isAdmin = localStorage.getItem('role') === 'ADMIN';

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User not authenticated. No token found.');
          setLoading(false);
          return;
        }

        const endpoint = isAdmin && userId ? `/api/v1/users/${userId}` : `/api/v1/users/me`;
        
        // 2. USE API.GET INSTEAD OF FETCH
        // This will automatically use your baseURL (https://amflow-backend.onrender.com)
        const response = await api.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = response.data; // axios puts data in response.data
        setUserData(data);
        if (!editMode) {
            setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                mobile: data.mobile || ''
            });
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId, isAdmin, editMode]); // Added editMode to dependency array

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setUpdateError(null);
    setUpdateSuccess(null);
    if (userData) {
        setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            mobile: userData.mobile || ''
        });
    }
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setUpdateError(null);
    setUpdateSuccess(null);
    if (userData) {
        setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            mobile: userData.mobile || ''
        });
    }
  };

  const handleSave = async () => {
    setUpdateError(null);
    setUpdateSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUpdateError('Authentication token not found. Please log in again.');
        return;
      }

      let endpoint = `/api/v1/users/me`; // Default for current user
      if (isAdmin && userId) {
        endpoint = `/api/v1/users/${userId}`;
      }
      
      const payload = {
        ...formData,
        mobile: formData.mobile ? Number(formData.mobile) : null
      };
      
      // 3. USE API.PUT INSTEAD OF FETCH
      // api.put(url, data, config)
      const response = await api.put(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'application/json' is automatic with axios
        },
      });

      const updatedUserData = response.data; // axios puts data in response.data
      setUserData(updatedUserData);
      setEditMode(false);
      setUpdateSuccess('Profile updated successfully!');
      setTimeout(() => setUpdateSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      // Get error message from axios response
      const message = err.response?.data?.message || err.message || 'An unexpected error occurred during update.';
      setUpdateError(message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'Invalid Date';
    }
  };

  const renderProfileImage = () => {
    const imageSize = { width: '150px', height: '150px' };
    if (userData && userData.profileImageUrl) {
      return <Image src={userData.profileImageUrl} alt="Profile" roundedCircle style={imageSize} className="profile-image-custom mb-3" />;
    }
    const nameForAvatar = userData?.firstName || userData?.username || 'U';
    const initial = nameForAvatar.charAt(0).toUpperCase();
    const bgColor = getAvatarColor(nameForAvatar);

    return (
      <div 
        className="profile-initial-avatar-custom d-flex justify-content-center align-items-center rounded-circle mb-3 mx-auto"
        style={{ ...imageSize, backgroundColor: bgColor, color: 'white', fontSize: '75px', fontWeight: 'bold' }}
      >
        {initial}
      </div>
    );
  };

  if (loading) {
    return <Container className="text-center mt-5"><p className="text-muted">Loading profile...</p></Container>;
  }

  if (error) {
    return <Container className="mt-5"><Alert variant="danger">Error: {error}</Alert></Container>;
  }

  if (!userData) {
    return <Container className="text-center mt-5"><p className="text-muted">No user data found.</p></Container>;
  }

  // (The rest of your JSX component is perfect, no changes needed)
  return (
    <Container className="mt-4 mb-5">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-light p-3">
              <h3 className="mb-0 text-dark fw-bold">{editMode ? 'Edit Profile' : 'User Profile'}</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {updateSuccess && <Alert variant="success" onClose={() => setUpdateSuccess(null)} dismissible>{updateSuccess}</Alert>}
              {updateError && <Alert variant="danger" onClose={() => setUpdateError(null)} dismissible>{updateError}</Alert>}

              <Row>
                <Col md={4} className="text-center mb-4 mb-md-0">
                  {renderProfileImage()}
                  {!editMode && (
                    <Button variant="dark" onClick={handleEdit} className="w-100 mt-3 text-uppercase fw-bold py-2">
                      Edit Profile
                    </Button>
                  )}
                </Col>
                <Col md={8}>
                  {!editMode ? (
                    <>
                      <h4 className="text-dark">{userData.firstName || ''} {userData.lastName || ''}</h4>
                      <p className="text-muted mb-1">@{userData.username || 'username'}</p>
                      <p className="text-muted mb-1"><small>ID: {userData.id || 'N/A'}</small></p>
                      <p className="text-muted mb-3"><small>Role: {userData.role || 'N/A'}</small></p>

                      <ListGroup variant="flush">
                        <ListGroup.Item className="px-0">
                          <strong className="text-dark">Email:</strong> {userData.email || 'No email provided.'}
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0">
                          <strong className="text-dark">Mobile:</strong> {userData.mobile || 'No mobile provided.'}
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0">
                          <strong className="text-dark">Joined:</strong> {formatDate(userData.createdAt)}
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0">
                          <strong className="text-dark">Last Updated:</strong> {formatDate(userData.updatedAt)}
                        </ListGroup.Item>
                      </ListGroup>
                    </>
                  ) : (
                    <Form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="formFirstName">
                            <Form.Label className="text-dark">First Name</Form.Label>
                            <Form.Control type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="formLastName">
                            <Form.Label className="text-dark">Last Name</Form.Label>
                            <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label className="text-dark">Email</Form.Label>
                        <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="formMobile">
                        <Form.Label className="text-dark">Mobile</Form.Label>
                        <Form.Control type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} />
                      </Form.Group>
                      <div className="mt-4 d-flex justify-content-end">
                        <Button variant="secondary" onClick={handleCancel} className="me-2 text-uppercase fw-bold py-2 px-3">
                          Cancel
                        </Button>
                        <Button variant="success" type="submit" className="text-uppercase fw-bold py-2 px-3">
                          Save Changes
                        </Button>
                      </div>
                    </Form>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;