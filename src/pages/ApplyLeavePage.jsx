import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Form,
  Button,
  Alert,
  Spinner,
  Card,
  Table,
  Badge,
} from "react-bootstrap";
import api from "../api";

function ApplyLeavePage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("");
  const [loading, setLoading] = useState(false);

  const [myLeaves, setMyLeaves] = useState([]);
  const [leavesLoading, setLeavesLoading] = useState(true);
  const [leavesError, setLeavesError] = useState("");

  const token = localStorage.getItem("token");

  const fetchMyLeaves = useCallback(async () => {
    setLeavesLoading(true);
    setLeavesError("");
    try {
      const response = await api.get(
        "/api/v1/leaves/my-leaves",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMyLeaves(response.data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      setLeavesError("Failed to load your leave history.");
    } finally {
      setLeavesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyLeaves();
  }, [fetchMyLeaves]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    if (!startDate || !endDate || !reason) {
      setMessage("Please fill in all fields.");
      setVariant("danger");
      setLoading(false);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setMessage("Start date cannot be in the past.");
      setVariant("danger");
      setLoading(false);
      return;
    }

    if (end < start) {
      setMessage("End date cannot be before start date.");
      setVariant("danger");
      setLoading(false);
      return;
    }

    try {
      await api.post(
        "/api/v1/leaves/apply",
        {
          startDate,
          endDate,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage("Leave request submitted successfully!");
      setVariant("success");
      setStartDate("");
      setEndDate("");
      setReason("");
      fetchMyLeaves();
    } catch (err) {
      console.error(
        "Leave application failed:",
        err.response ? err.response.data : err.message
      );
      setMessage(
        `Failed to submit leave request: ${
          err.response?.data?.message || err.message
        }`
      );
      setVariant("danger");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return <Badge bg="success">Approved</Badge>;
      case "REJECTED":
        return <Badge bg="danger">Rejected</Badge>;
      case "PENDING":
      default:
        return (
          <Badge bg="warning" text="dark">
            Pending
          </Badge>
        );
    }
  };

  return (
    <Container className="py-5" style={{ minHeight: "90vh" }}>
      <Card
        className="mb-4 shadow-sm w-100"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <Card.Body>
          <Card.Title as="h2" className="text-center mb-4">
            Apply for Leave
          </Card.Title>
          {message && (
            <Alert variant={variant} onClose={() => setMessage("")} dismissible>
              {message}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formStartDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEndDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formReason">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter reason for leave"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100 btn-dark"
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Submit Leave Request"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card
        className="shadow-sm w-100"
        style={{ maxWidth: "800px", margin: "0 auto" }}
      >
        <Card.Body>
          <Card.Title as="h4" className="mb-3">
            My Leave History
          </Card.Title>
          {leavesLoading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : leavesError ? (
            <Alert variant="danger">{leavesError}</Alert>
          ) : myLeaves.length === 0 ? (
            <p className="text-center">No leave records found.</p>
          ) : (
            <Table responsive striped bordered hover className="mt-3">
              <thead>
                <tr>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((leave, index) => (
                  <tr key={index}>
                    <td>{leave.startDate}</td>
                    <td>{leave.endDate}</td>
                    <td>{leave.reason}</td>
                    <td>{getStatusBadge(leave.status)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ApplyLeavePage;
