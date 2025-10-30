import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <div className="hero-container py-5">
      <Container className="text-center">
        <h1 className='hero-h1'>Welcome to Our Attendance System</h1>
        <p className="lead">Effortlessly manage your attendance and leaves.</p>
        <p className='hero-btn'>
          <Button as={Link} to="/login" variant="info" className='btn-dark btn-large'>Get Started</Button>
        </p>
      </Container>
    </div>
  );
}

export default Hero;