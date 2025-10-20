import React, { useEffect, useState } from "react";
import {
  getFixtures,
  createFixture,
  deleteFixture,
} from "../api.js";

export default function Fixtures() {
  const [fixtures, setFixtures] = useState([]);
  const [formData, setFormData] = useState({
    tester_type: "",
    fixture_name: "",
    rack: "",
    fixture_sn: "",
    test_type: "",
    ip_address: "",
    mac_address: "",
    creator: "",
  });

  // Load fixtures when page loads
  useEffect(() => {
    loadFixtures();
  }, []);

  const loadFixtures = async () => {
    try {
      const res = await getFixtures();
      setFixtures(res.data);
    } catch (err) {
      console.error("Error loading fixtures:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFixture(formData);
      setFormData({
        tester_type: "",
        fixture_name: "",
        rack: "",
        fixture_sn: "",
        test_type: "",
        ip_address: "",
        mac_address: "",
        creator: "",
      });
      loadFixtures();
    } catch (err) {
      console.error("Error adding fixture:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this fixture?")) {
      await deleteFixture(id);
      loadFixtures();
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Fixtures</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input name="tester_type" placeholder="Tester Type" value={formData.tester_type} onChange={handleChange} />
        <input name="fixture_name" placeholder="Fixture Name" value={formData.fixture_name} onChange={handleChange} />
        <input name="rack" placeholder="Rack" value={formData.rack} onChange={handleChange} />
        <input name="fixture_sn" placeholder="Fixture SN" value={formData.fixture_sn} onChange={handleChange} />
        <input name="test_type" placeholder="Test Type" value={formData.test_type} onChange={handleChange} />
        <input name="ip_address" placeholder="IP Address" value={formData.ip_address} onChange={handleChange} />
        <input name="mac_address" placeholder="MAC Address" value={formData.mac_address} onChange={handleChange} />
        <input name="creator" placeholder="Creator" value={formData.creator} onChange={handleChange} />
        <button type="submit">Add Fixture</button>
      </form>

      {fixtures.length === 0 ? (
        <p>No fixtures found.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fixture Name</th>
              <th>Tester Type</th>
              <th>Rack</th>
              <th>Test Type</th>
              <th>IP</th>
              <th>MAC</th>
              <th>Creator</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fixtures.map((fx) => (
              <tr key={fx.id}>
                <td>{fx.id}</td>
                <td>{fx.fixture_name}</td>
                <td>{fx.tester_type}</td>
                <td>{fx.rack}</td>
                <td>{fx.test_type}</td>
                <td>{fx.ip_address}</td>
                <td>{fx.mac_address}</td>
                <td>{fx.creator}</td>
                <td>
                  <button onClick={() => handleDelete(fx.id)}>❌ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
