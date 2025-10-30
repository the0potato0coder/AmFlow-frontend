import React, { useState, useEffect } from "react";
import { Container, Card, Alert, Spinner, Row, Col, Form, ListGroup } from "react-bootstrap";
import api from "../api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useParams } from "react-router-dom";

// Helper function to calculate ISO week of the year
const getISOWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number.
  // If Sunday, current day number is 0, so add 4 - 0 = 4 days.
  // If Monday, current day number is 1, so add 4 - 1 = 3 days.
  // ...
  // If Saturday, current day number is 6, so add 4 - 6 = -2 days.
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7)); // d.getUTCDay() returns 0 for Sunday
  // Get the year of the Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

function UserStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userId: userIdFromParams } = useParams();
  const token = localStorage.getItem("token");
  const loggedInUserId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");

  const userId = userRole === 'ADMIN' && userIdFromParams ? userIdFromParams : loggedInUserId;

  // Get current year and week/month for initial display
  const initialYear = new Date().getFullYear();
  const initialMonth = new Date().getMonth() + 1; // Month is 0-indexed
  const currentWeek = getISOWeek(new Date()); // Use the new ISO week calculation

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedWeekYear, setSelectedWeekYear] = useState(initialYear);
  const [selectedWeekOfYear, setSelectedWeekOfYear] = useState(currentWeek);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const attendanceEndpoint = userRole === 'ADMIN' && userIdFromParams
          ? `/api/v1/attendance/user/${userId}/all`
          : `/api/v1/attendance/my-all`;

        const weeklyStatsEndpoint = userRole === 'ADMIN' && userIdFromParams
          ? `/api/v1/attendance/user/${userId}/stats/weekly?year=${selectedWeekYear}&weekOfYear=${selectedWeekOfYear}`
          : `/api/v1/attendance/my-stats/weekly?year=${selectedWeekYear}&weekOfYear=${selectedWeekOfYear}`;
        
        const monthlyStatsEndpoint = userRole === 'ADMIN' && userIdFromParams
          ? `/api/v1/attendance/user/${userId}/stats/monthly?year=${selectedYear}&month=${selectedMonth}`
          : `/api/v1/attendance/my-stats/monthly?year=${selectedYear}&month=${selectedMonth}`;

        // Fetch all attendance records for the logged-in user using the new endpoint
        const allAttendanceResponse = await api.get(
          attendanceEndpoint,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch weekly stats for current week (now using ISO week)
        const weeklyStatsResponse = await api.get(
          weeklyStatsEndpoint,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch monthly stats for selected month and year
        const monthlyStatsResponse = await api.get(
          monthlyStatsEndpoint,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStats({
          allAttendances: allAttendanceResponse.data,
          weeklyStats: weeklyStatsResponse.data,
          monthlyStats: monthlyStatsResponse.data,
        });
      } catch (err) {
        console.error("Failed to fetch user stats:", err.response ? err.response.data : err.message);
        setError(`Failed to fetch attendance stats: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, userId, selectedYear, selectedMonth, selectedWeekYear, selectedWeekOfYear]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="dark" role="status" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Loading Your Stats...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container className="mt-4">
        <Alert variant="info">
          <Alert.Heading>No Stats Available</Alert.Heading>
          <p>We couldn't find any attendance statistics for your account at the moment.</p>
        </Alert>
      </Container>
    );
  }

  // Helper to convert HH:mm:ss duration string to total hours for chart
  const durationToHours = (durationString) => {
    if (!durationString || durationString === "00:00:00") return 0;
    const parts = durationString.split(':').map(Number);
    // Convert to total hours: hours + (minutes / 60) + (seconds / 3600)
    return parts[0] + (parts[1] / 60) + (parts[2] / 3600);
  };

  // Prepare data for weekly chart
  const weeklyChartData = stats.weeklyStats?.dailyBreakdown?.map(day => ({
    date: day.date,
    'Working Hours (hours)': durationToHours(day.totalHours.replace(/hours, | minutes, | seconds/g, ':').slice(0, -1)),
  })) || [];

  // Prepare data for monthly chart
  const monthlyChartData = Object.entries(stats.monthlyStats?.weeklyBreakdown || {}).map(([week, duration]) => ({
    week: week,
    'Working Hours (hours)': durationToHours(duration.replace(/hours, | minutes, | seconds/g, ':').slice(0, -1)),
  }));

  const yearOptions = () => {
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(initialYear - i);
    }
    return years;
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 pb-3 text-center text-white fw-bold display-6 border-bottom">Your Attendance Statistics</h2>

      <Row>
        <Col lg={12} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header as="h5" className="bg-dark text-white">
              All Attendance Records ({stats.allAttendances ? stats.allAttendances.length : 0})
            </Card.Header>
            <Card.Body style={{ maxHeight: '450px', overflowY: 'auto' }}>
              {stats.allAttendances && stats.allAttendances.length > 0 ? (
                <ListGroup variant="flush">
                  {stats.allAttendances.map((record) => (
                    <ListGroup.Item key={record.id} className="px-0 py-2">
                      <Row>
                        <Col md={5}>
                          <strong>Check In:</strong> {new Date(record.checkInTime).toLocaleString()}
                        </Col>
                        <Col md={5}>
                          <strong>Check Out:</strong> {record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : <span className="text-muted fst-italic">Not clocked out</span>}
                        </Col>
                        <Col md={2} className="text-md-end">
                          <small className="text-muted">{record.totalDurationFormatted || 'N/A'}</small>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-center text-muted mt-3 fst-italic">No attendance records found.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header as="h5" className="bg-dark text-white">
              Weekly Statistics
            </Card.Header>
            <Card.Body>
              <Form className="mb-3 p-3 bg-light rounded">
                <Row className="g-2 align-items-center">
                  <Col xs="auto">
                    <Form.Label htmlFor="week-year-select" className="mb-0 fw-bold">Year:</Form.Label>
                  </Col>
                  <Col xs="auto">
                    <Form.Select
                      id="week-year-select"
                      value={selectedWeekYear}
                      onChange={(e) => setSelectedWeekYear(parseInt(e.target.value))}
                      size="sm"
                    >
                      {yearOptions().map(y => (<option key={y} value={y}>{y}</option>))}
                    </Form.Select>
                  </Col>
                  <Col xs="auto">
                    <Form.Label htmlFor="week-select" className="mb-0 ms-2 fw-bold">Week:</Form.Label>
                  </Col>
                  <Col xs="auto">
                    <Form.Control
                      type="number"
                      id="week-select"
                      value={selectedWeekOfYear}
                      onChange={(e) => setSelectedWeekOfYear(parseInt(e.target.value))}
                      min="1" max="53" size="sm" style={{ width: '80px' }}
                    />
                  </Col>
                </Row>
              </Form>

              <div className="p-3 mb-3 bg-light-subtle border rounded">
                   <Row>
                     <Col>
                           <p className="mb-1"><strong className="text-secondary-emphasis">Total Working Days:</strong> {stats.weeklyStats?.totalWorkingDaysThisWeek ?? 'N/A'}</p>
                     </Col>
                     <Col>
                           <p className="mb-0"><strong className="text-secondary-emphasis">Total Hours This Week:</strong> {stats.weeklyStats?.totalHoursThisWeek ?? 'N/A'}</p>
                     </Col>
                   </Row>
              </div>

              <h5 className="mt-3 mb-2">Daily Breakdown:</h5>
              {stats.weeklyStats?.dailyBreakdown && stats.weeklyStats.dailyBreakdown.length > 0 ? (
                <ListGroup variant="flush" className="mb-3">
                  {stats.weeklyStats.dailyBreakdown.map((day, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center px-1 py-1">
                      <span><strong>{day.date}:</strong></span>
                      <span className="text-muted">{day.totalHours}</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="fst-italic text-muted">No daily breakdown available for this week.</p>
              )}
              <h5 className="mt-4">Weekly Hours Chart:</h5>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyChartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft', fontSize: 12, offset: -5}} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `${value.toFixed(2)} hours`} />
                  <Legend wrapperStyle={{fontSize: "12px"}}/>
                  <Line type="monotone" dataKey="Working Hours (hours)" stroke="#198754" activeDot={{ r: 6 }} strokeWidth={2}/>
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header as="h5" className="bg-dark text-white">
              Monthly Statistics
            </Card.Header>
            <Card.Body>
              <Form className="mb-3 p-3 bg-light rounded">
                <Row className="g-2 align-items-center">
                  <Col xs="auto">
                    <Form.Label htmlFor="month-select" className="mb-0 fw-bold">Month:</Form.Label>
                  </Col>
                  <Col xs="auto">
                    <Form.Select
                      id="month-select"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      size="sm"
                    >
                      {[...Array(12).keys()].map(m => (<option key={m + 1} value={m + 1}>{new Date(0, m).toLocaleString('default', { month: 'long' })}</option>))}
                    </Form.Select>
                  </Col>
                  <Col xs="auto">
                    <Form.Label htmlFor="year-select-month" className="mb-0 ms-2 fw-bold">Year:</Form.Label>
                  </Col>
                  <Col xs="auto">
                    <Form.Select
                      id="year-select-month"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      size="sm"
                    >
                      {yearOptions().map(y => (<option key={y} value={y}>{y}</option>))}
                    </Form.Select>
                  </Col>
                </Row>
              </Form>

              <h5 className="mt-3 mb-2">Weekly Breakdown:</h5>
              {stats.monthlyStats?.weeklyBreakdown && Object.keys(stats.monthlyStats.weeklyBreakdown).length > 0 ? (
                   <ListGroup variant="flush" className="mb-3">
                     {Object.entries(stats.monthlyStats.weeklyBreakdown).map(([week, duration], index) => (
                       <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center px-1 py-1">
                         <span><strong>{week}:</strong></span>
                         <span className="text-muted">{duration}</span>
                       </ListGroup.Item>
                     ))}
                   </ListGroup>
              ) : (
                <p className="fst-italic text-muted">No weekly breakdown available for this month.</p>
              )}
              <h5 className="mt-4">Monthly Hours Chart:</h5>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={monthlyChartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                        <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft', fontSize: 12, offset: -5}} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => `${value.toFixed(2)} hours`} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Line type="monotone" dataKey="Working Hours (hours)" stroke="#0dcaf0" activeDot={{ r: 6 }} strokeWidth={2}/>
                    </LineChart>
                </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default UserStatsPage;
