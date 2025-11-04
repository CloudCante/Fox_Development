import React, { useEffect, useState } from "react";
import "./FixturesPage.css";


export default function FixturesPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch fixtures from backend
  useEffect(() => {
    fetch("http://localhost:5000/fixtures")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setFixtures(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading fixtures...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Fixtures List</h1>
      <table>
        <thead>
          <tr>
            <th>Fixture Name</th>
            <th>Tester Type</th>
            <th>Rack</th>
            <th>Fixture SN</th>
            <th>Test Type</th>
            <th>IP Address</th>
            <th>MAC Address</th>
            <th>Creator</th>
            <th>Create Date</th>
          </tr>
        </thead>
        <tbody>
          {fixtures.map((fixture) => (
            <tr key={fixture.id}>
              <td>{fixture.fixture_name}</td>
              <td>{fixture.tester_type}</td>
              <td>{fixture.rack}</td>
              <td>{fixture.fixture_sn}</td>
              <td>{fixture.test_type}</td>
              <td>{fixture.ip_address}</td>
              <td>{fixture.mac_address}</td>
              <td>{fixture.creator}</td>
              <td>{new Date(fixture.create_date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
