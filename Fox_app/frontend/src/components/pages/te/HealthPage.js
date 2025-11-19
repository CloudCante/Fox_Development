import React, { useEffect, useState } from "react";
import { 
    getHealth, 
    createHealth, 
    updateHealth, 
    deleteHealth 
} from "../../../services/api";


const HealthPage = () => {
  const [healthItems, setHealthItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", status: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState("");

  // Load all Health (READ)
  const fetchHealth = async () => {
    try {
      const response = await getHealth();
      setHealthItems(response.data);
    } catch {
      setError("Failed to load health items");
    }
  };

 useEffect(() => {
  const loadData = async () => {
    await fetchHealth();
  };
  loadData();
}, []);


  // CREATE
  const handleCreate = async () => {
    try {
      await createHealth(newItem);
      setNewItem({ name: "", status: "" });
      fetchHealth();
    } catch {
      setError("Failed to create health item");
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!editingItem) return;
    try {
      await updateHealth(editingItem.id, editingItem);
      setEditingItem(null);
      fetchHealth();
    } catch {
      setError("Failed to update health item");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    try {
      await deleteHealth(id);
      fetchHealth();
    } catch {
      setError("Failed to delete health item");
    }
  };

  return (
    <div>
      <h1>Health</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

    {/* Create form */}
      <input
        type="text"
        placeholder="Name"
        value={newItem.name}
        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Status"
        value={newItem.status}
        onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
      />
      <button onClick={handleCreate}>Add Item</button>

    {/* Health list */}
      <ul>
        {healthItems.map((item) => (
          <li key={item.id}>
            {editingItem?.id === item.id ? (
              <>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  value={editingItem.status}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, status: e.target.value })
                  }
                />
                <button onClick={handleUpdate}>Save</button>
                <button onClick={() => setEditingItem(null)}>Cancel</button>
              </>
            ) : (
              <>
                {item.name} ({item.status})
                <button onClick={() => setEditingItem(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthPage;
