import React from 'react';

const Footer = () => {
  return (
    <footer className="footer mt-auto bg-light border-top text-center site-footer">
      <div className="container">
        <div className="mb-2">
          <strong>Location:</strong> 📍 Chennai, India
        </div>
        <div>
          <small className="text-muted">&copy; {new Date().getFullYear()} Amflow. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;