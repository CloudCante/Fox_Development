import React, { useEffect, useState } from "react";
import { 
    getMaintenance, 
    createMaintenance, 
    updateMaintenance, 
    deleteMaintenance 
} from "../../../services/api";


const MaintenancePage = () => {
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({ fixture_id: "", description: "" });
  const [editingRecord, setEditingRecord] = useState(null);
  const [error, setError] = useState("");

  // Load all maintenance (READ)
  const fetchRecords = async () => {
    try {
      const response = await getMaintenance();
      setRecords(response.data);
    } catch {
      setError("Failed to load maintenance records");
    }
  };

  useEffect(() => {
  const loadRecords = async () => {
    await fetchRecords();
  };
  loadRecords();
}, []);


  // CREATE
  const handleCreate = async () => {
    try {
      await createMaintenance(newRecord);
      setNewRecord({ fixture_id: "", description: "" });
      fetchRecords();
    } catch {
      setError("Failed to create maintenance record");
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!editingRecord) return;
    try {
      await updateMaintenance(editingRecord.id, editingRecord);
      setEditingRecord(null);
      fetchRecords();
    } catch {
      setError("Failed to update maintenance record");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    try {
      await deleteMaintenance(id);
      fetchRecords();
    } catch {
      setError("Failed to delete maintenance record");
    }
  };

  return (
    <div>
      <h1>Maintenance Records</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

    {/* Create form */}
      <input
        type="text"
        placeholder="Fixture ID"
        value={newRecord.fixture_id}
        onChange={(e) => setNewRecord({ ...newRecord, fixture_id: e.target.value })}
      />
      <input
        type="text"
        placeholder="Description"
        value={newRecord.description}
        onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
      />
      <button onClick={handleCreate}>Add Record</button>

    {/* Maintenance list */}
      <ul>
        {records.map((r) => (
          <li key={r.id}>
            {editingRecord?.id === r.id ? (
              <>
                <input
                  type="text"
                  value={editingRecord.fixture_id}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, fixture_id: e.target.value })
                  }
                />
                <input
                  type="text"
                  value={editingRecord.description}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, description: e.target.value })
                  }
                />
                <button onClick={handleUpdate}>Save</button>
                <button onClick={() => setEditingRecord(null)}>Cancel</button>
              </>
            ) : (
              <>
                {r.fixture_id}: {r.description}
                <button onClick={() => setEditingRecord(r)}>Edit</button>
                <button onClick={() => handleDelete(r.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaintenancePage;
