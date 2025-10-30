import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
  Button,
} from "react-bootstrap";

function Navbar({ isAuthenticated = false, userRole = "", onLogout = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    onLogout(); // Update parent state
    navigate("/login");
  };

  // Determine the target for the brand link based on authentication and role
  let brandLinkTo = "/";
  if (isAuthenticated) {
    if (userRole === "ADMIN") {
      brandLinkTo = "/admin-dashboard";
    } else if (userRole === "EMPLOYEE") {
      brandLinkTo = "/employee-dashboard";
    }
  }

  return (
    <nav className="customStyle">
      <BootstrapNavbar bg="light" expand="lg" className="shadow-sm">
        <Container fluid>
          <BootstrapNavbar.Brand as={Link} to={brandLinkTo}>
            <h3>Amflow</h3>
          </BootstrapNavbar.Brand>
          <BootstrapNavbar.Toggle aria-controls="navbarNav" />
          <BootstrapNavbar.Collapse id="navbarNav">
            <Nav className="me-auto mb-2 mb-lg-0">
              {!isAuthenticated && (
                <Nav.Item>
                  <Nav.Link as={Link} to="/" active={location.pathname === "/"}>
                    Home
                  </Nav.Link>
                </Nav.Item>
              )}
              {userRole === "EMPLOYEE" && (
                <>
                  <Nav.Item>
                    <Nav.Link
                      as={Link}
                      to="/employee-dashboard"
                      active={location.pathname === "/employee-dashboard"}
                    >
                      Dashboard
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      as={Link}
                      to="/mark-attendance"
                      active={location.pathname === "/mark-attendance"}
                    >
                      Mark Attendance
                    </Nav.Link>
                  </Nav.Item>
                </>
              )}
              {userRole === "ADMIN" && (
                <>
                  <Nav.Item>
                    <Nav.Link
                      as={Link}
                      to="/admin-dashboard"
                      active={location.pathname === "/admin-dashboard"}
                    >
                      Admin Dashboard
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      as={Link}
                      to="/employee-dashboard"
                      active={location.pathname === "/employee-dashboard"}
                    >
                      Employee View
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      as={Link}
                      to="/mark-attendance"
                      active={location.pathname === "/mark-attendance"}
                    >
                      Mark Attendance
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      as={Link}
                      to="/register"
                      active={location.pathname === "/register"}
                    >
                      Register
                    </Nav.Link>
                  </Nav.Item>
                </>
              )}
            </Nav>
            <div className="d-flex align-items-center">
              {!isAuthenticated ? (
                <>
                  <Button as={Link} to="/login" variant="primary" size="sm">
                    Login
                  </Button>
                </>
              ) : (
                <>
                  <Nav.Link
                    as={Link}
                    to="/profile"
                    active={location.pathname === "/profile"}
                    className="me-3"
                  >
                    Profile
                  </Nav.Link>
                  <BootstrapNavbar.Text className="me-3">
                    Welcome, {username || "User"}
                  </BootstrapNavbar.Text>
                  <Button
                    onClick={handleLogout}
                    variant="outline-danger"
                    size="sm"
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>
    </nav>
  );
}

export default Navbar;
