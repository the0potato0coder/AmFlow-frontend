import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Import images from src/images folder
import statsImage from '../images/stats-dash.png'; // Adjust path if your images folder is elsewhere in src
import leaveImage from '../images/leave-dash.png';
import adjustmentImage from '../images/top-dash.png';

function EmployeeDashboard() {
  const cardData = [
    {
      title: "View My Stats",
      text: "See your attendance records and detailed weekly/monthly statistics.",
      link: "/user-stats",
      buttonText: "View Stats",
      bgImage: statsImage, // Use the imported image variable
    },
    {
      title: "Apply for Leave",
      text: "Submit a new leave request for approval.",
      link: "/apply-leave",
      buttonText: "Apply Leave",
      bgImage: leaveImage, // Use the imported image variable
    },
    {
      title: "Request Attendance Adjustment",
      text: "Request a top-up or correction for your attendance record.",
      link: "/apply-top-up",
      buttonText: "Apply Top-Up",
      bgImage: adjustmentImage, // Use the imported image variable
    },
  ];

  return (
    <Container className="text-white">
      <h2 className="mb-4 text-center">Employee Dashboard</h2>
      <Row className="justify-content-center">
        {cardData.map((card, index) => (
          <Col md={4} className="mb-4" key={index}>
            <Card
              className="text-center shadow-lg h-100 text-black"
              style={{
                backgroundImage: `url(${card.bgImage})`,
                backgroundSize:'cover',
                backgroundPosition: 'center',
                position: 'relative',
                color: 'white', // Ensure text is white for contrast
                minHeight: '280px', // Set a minimum height for uniformity
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between', // Push button to bottom
              }}
            >
              <Card.Body className="d-flex flex-column justify-content-between align-items-center">
                <div>
                  <Card.Title className="mb-3" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {card.title}
                  </Card.Title>
                  <Card.Text className="mb-4" style={{ fontSize: '1rem' }}>
                    {card.text}
                  </Card.Text>
                </div>
                <Button as={Link} to={card.link} variant="light" className="btn-dark">
                  {card.buttonText}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default EmployeeDashboard;