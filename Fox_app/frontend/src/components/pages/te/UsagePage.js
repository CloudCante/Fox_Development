import React, { useEffect, useState } from "react";
import { 
    getUsage, 
    createUsage, 
    updateUsage, 
    deleteUsage 
} from "../../../services/api";


const UsagePage = () => {
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({ fixture_id: "", usage_hours: "" });
  const [editingRecord, setEditingRecord] = useState(null);
  const [error, setError] = useState("");

  // Load all usage (READ)
  const fetchRecords = async () => {
    try {
      const response = await getUsage();
      setRecords(response.data);
    } catch {
      setError("Failed to load usage records");
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
      await createUsage(newRecord);
      setNewRecord({ fixture_id: "", usage_hours: "" });
      fetchRecords();
    } catch {
      setError("Failed to create usage record");
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!editingRecord) return;
    try {
      await updateUsage(editingRecord.id, editingRecord);
      setEditingRecord(null);
      fetchRecords();
    } catch {
      setError("Failed to update usage record");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    try {
      await deleteUsage(id);
      fetchRecords();
    } catch {
      setError("Failed to delete usage record");
    }
  };

  return (
    <div>
      <h1>Usage Records</h1>
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
        placeholder="Usage Hours"
        value={newRecord.usage_hours}
        onChange={(e) => setNewRecord({ ...newRecord, usage_hours: e.target.value })}
      />
      <button onClick={handleCreate}>Add Record</button>

    {/* Usage list */}
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
                  value={editingRecord.usage_hours}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, usage_hours: e.target.value })
                  }
                />
                <button onClick={handleUpdate}>Save</button>
                <button onClick={() => setEditingRecord(null)}>Cancel</button>
              </>
            ) : (
              <>
                {r.fixture_id}: {r.usage_hours} hrs
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

export default UsagePage;
