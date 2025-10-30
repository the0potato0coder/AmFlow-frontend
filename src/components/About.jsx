import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function About() {
  return (
    <Container className="py-5 text-center about-container">
      <h2>
        <span className="typewriter-heading">About Our System</span>
      </h2>
      <Row className="justify-content-center">
        <Col md={8}>
          <p className="text-center">
            Simplify your attendance tracking with our intuitive system!
            Register, check in, and check out effortlessly. Gain instant access
            to your weekly and monthly attendance stats, visualizing your work
            duration with ease. Clients receive comprehensive, detailed reports
            for precise oversight. Experience seamless attendance management,
            boosting productivity and transparency for everyone. Get started
            today and transform how you track time!
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default About;