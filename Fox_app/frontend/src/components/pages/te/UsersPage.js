import React, { useEffect, useState } from "react";
import { 
    getUsers, 
    createUser, 
    updateUser, 
    deleteUser 
} from "../../../services/api";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", role: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");

  // Load all users (READ)
  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch {
      setError("Failed to load users");
    }
  };

  useEffect(() => {
  const loadUsers = async () => {
    await fetchUsers();
  };
  loadUsers();
}, []);


  // CREATE
  const handleCreate = async () => {
    try {
      await createUser(newUser);
      setNewUser({ username: "", role: "" });
      fetchUsers();
    } catch {
      setError("Failed to create user");
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, editingUser);
      setEditingUser(null);
      fetchUsers();
    } catch {
      setError("Failed to update user");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      fetchUsers();
    } catch {
      setError("Failed to delete user");
    }
  };

  return (
    <div>
      <h1>Users</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

    {/* Create form */}
      <input
        type="text"
        placeholder="Username"
        value={newUser.username}
        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
      />
      <input
        type="text"
        placeholder="Role"
        value={newUser.role}
        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
      />
      <button onClick={handleCreate}>Add User</button>

    {/* Users list */}
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {editingUser?.id === u.id ? (
              <>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, username: e.target.value })
                  }
                />
                <input
                  type="text"
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                />
                <button onClick={handleUpdate}>Save</button>
                <button onClick={() => setEditingUser(null)}>Cancel</button>
              </>
            ) : (
              <>
                {u.username} ({u.role})
                <button onClick={() => setEditingUser(u)}>Edit</button>
                <button onClick={() => handleDelete(u.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
