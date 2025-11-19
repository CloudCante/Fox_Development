// ============================================================================
// File: FixturesPage.js
//
// PURPOSE:
//   Frontend page for displaying and managing 'fixtures'.
//   - Supports full CRUD operations via API.
//   - Automatically refreshes list after create/update/delete.
//   - Dynamically filters parent B Testers for LA/RA Slots.
// NOTES:
//   - Uses React hooks (useState, useEffect)
//   - Calls backend API via api.js
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  getFixtures,
  getBTesters,
  createFixture,
  updateFixture,
  deleteFixture,
  getEligibleBTesters // new function in api.js
} from "../../../services/api";

const FixturesPage = () => {
  // State
  const [fixtures, setFixtures] = useState([]);
  const [bTesters, setBTesters] = useState([]);
  const [eligibleBTesters, setEligibleBTesters] = useState([]); // For LA/RA slots
  const [newFixture, setNewFixture] = useState({
    tester_type: "",
    fixture_name: "",
    rack: "",
    fixture_sn: "",
    test_type: "",
    ip_address: "",
    mac_address: "",
    parent: "",
    creator: ""
  });
  const [error, setError] = useState("");

  // =====================================================
  // Fetch all fixtures on page load
  // =====================================================
  const fetchFixtures = async () => {
    try {
      const response = await getFixtures();
      setFixtures(response.data);
    } catch (err) {
      console.error("Error fetching fixtures:", err);
    }
  };

  // =====================================================
  // Fetch all B Testers (general dropdown for reference)
  // =====================================================
  const fetchBTesters = async () => {
    try {
      const response = await getBTesters();
      setBTesters(response.data);
    } catch (err) {
      console.error("Error fetching B Testers:", err);
    }
  };

  // =====================================================
  // Fetch eligible B Testers for LA/RA slot parent dropdown
  // =====================================================
  const fetchEligibleBTesters = async (slotType) => {
    if (!slotType) return setEligibleBTesters([]);
    try {
      const response = await getEligibleBTesters(slotType);
      setEligibleBTesters(response.data);
    } catch (err) {
      console.error("Error fetching eligible B Testers:", err);
      setEligibleBTesters([]);
    }
  };

  // =====================================================
  // Effect to fetch fixtures and all B Testers on mount
  // =====================================================
  useEffect(() => {
    fetchFixtures();
    fetchBTesters();
  }, []);

  // =====================================================
  // Watcher: whenever tester_type changes, update eligible B Testers
  // =====================================================
  useEffect(() => {
    if (newFixture.tester_type === "LA Slot" || newFixture.tester_type === "RA Slot") {
      fetchEligibleBTesters(newFixture.tester_type);
      setNewFixture({ ...newFixture, parent: "" }); // Reset parent selection
    } else {
      setEligibleBTesters([]);
      setNewFixture({ ...newFixture, parent: "" });
    }
  }, [newFixture.tester_type]);

  // =====================================================
  // CREATE a new fixture
  // =====================================================
  const handleCreateFixture = async () => {
    try {
      setError("");

      // Auto-fill IP/MAC for LA/RA Slot
      if ((newFixture.tester_type === "LA Slot" || newFixture.tester_type === "RA Slot") && newFixture.parent) {
        const parent = bTesters.find(b => b.id === newFixture.parent);
        if (parent) {
          newFixture.ip_address = parent.ip_address || "";
          newFixture.mac_address = parent.mac_address || "";
        }
      }

      const response = await createFixture(newFixture);
      console.log("Fixture created:", response.data);

      // Clear form
      setNewFixture({
        tester_type: "",
        fixture_name: "",
        rack: "",
        fixture_sn: "",
        test_type: "",
        ip_address: "",
        mac_address: "",
        parent: "",
        creator: ""
      });

      // Refresh lists
      fetchFixtures();
      fetchBTesters();
    } catch (err) {
      console.error("Error creating fixture:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to create fixture");
    }
  };

  // =====================================================
  // DELETE a fixture
  // =====================================================
  const handleDeleteFixture = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fixture?")) return;
    try {
      await deleteFixture(id);
      fetchFixtures();
      fetchBTesters();
    } catch (err) {
      console.error("Error deleting fixture:", err.response?.data || err.message);
    }
  };

  // =====================================================
  // UPDATE fixture (inline edit example)
  // =====================================================
  const handleUpdateFixture = async (id, updatedFields) => {
    try {
      await updateFixture(id, updatedFields);
      fetchFixtures();
      fetchBTesters();
    } catch (err) {
      console.error("Error updating fixture:", err.response?.data || err.message);
    }
  };

  return (
    <div>
      <h1>Fixtures</h1>

      {/* =====================================================
          Display errors
      ===================================================== */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* =====================================================
          New Fixture Form
      ===================================================== */}
      <div>
        <h2>Create New Fixture</h2>

        {/* Tester Type Dropdown */}
        <label>Tester Type:</label>
        <select
          value={newFixture.tester_type}
          onChange={(e) => setNewFixture({ ...newFixture, tester_type: e.target.value })}
        >
          <option value="">Select Tester Type</option>
          <option value="B Tester">B Tester</option>
          <option value="LA Slot">LA Slot</option>
          <option value="RA Slot">RA Slot</option>
        </select>

        {/* Parent B Tester Dropdown only for LA/RA Slot */}
        {(newFixture.tester_type === "LA Slot" || newFixture.tester_type === "RA Slot") && (
          <>
            <label>Parent B Tester:</label>
            <select
              value={newFixture.parent}
              onChange={(e) => setNewFixture({ ...newFixture, parent: e.target.value })}
            >
              <option value="">Select Parent B Tester</option>
              {eligibleBTesters.map(b => (
                <option key={b.id} value={b.id}>
                  {b.fixture_name} ({b.fixture_sn})
                </option>
              ))}
            </select>
          </>
        )}

        <input
          placeholder="Fixture Name"
          value={newFixture.fixture_name}
          onChange={(e) => setNewFixture({ ...newFixture, fixture_name: e.target.value })}
        />
        <input
          placeholder="Rack"
          value={newFixture.rack}
          onChange={(e) => setNewFixture({ ...newFixture, rack: e.target.value })}
        />
        <input
          placeholder="Serial Number"
          value={newFixture.fixture_sn}
          onChange={(e) => setNewFixture({ ...newFixture, fixture_sn: e.target.value })}
        />
        <input
          placeholder="Test Type"
          value={newFixture.test_type}
          onChange={(e) => setNewFixture({ ...newFixture, test_type: e.target.value })}
        />
        <input
          placeholder="IP Address (for B Tester)"
          value={newFixture.ip_address}
          onChange={(e) => setNewFixture({ ...newFixture, ip_address: e.target.value })}
          disabled={newFixture.tester_type === "LA Slot" || newFixture.tester_type === "RA Slot"}
        />
        <input
          placeholder="MAC Address (for B Tester)"
          value={newFixture.mac_address}
          onChange={(e) => setNewFixture({ ...newFixture, mac_address: e.target.value })}
          disabled={newFixture.tester_type === "LA Slot" || newFixture.tester_type === "RA Slot"}
        />
        <input
          placeholder="Creator"
          value={newFixture.creator}
          onChange={(e) => setNewFixture({ ...newFixture, creator: e.target.value })}
        />
        <button onClick={handleCreateFixture}>Create Fixture</button>
      </div>

      {/* =====================================================
          Fixtures Table
      ===================================================== */}
      <h2>All Fixtures</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Tester Type</th>
            <th>Name</th>
            <th>Rack</th>
            <th>Serial</th>
            <th>Test Type</th>
            <th>IP</th>
            <th>MAC</th>
            <th>Parent</th>
            <th>Creator</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fixtures.map((f) => (
            <tr key={f.id}>
              <td>{f.tester_type}</td>
              <td>{f.fixture_name}</td>
              <td>{f.rack}</td>
              <td>{f.fixture_sn}</td>
              <td>{f.test_type}</td>
              <td>{f.ip_address}</td>
              <td>{f.mac_address}</td>
              <td>{f.parent}</td>
              <td>{f.creator}</td>
              <td>
                <button onClick={() => handleDeleteFixture(f.id)}>Delete</button>
                {/* Inline edit example */}
                <button
                  onClick={() =>
                    handleUpdateFixture(f.id, { fixture_name: prompt("New name:", f.fixture_name) || f.fixture_name })
                  }
                >
                  Edit Name
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FixturesPage;
