// AdminUserManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminUserManagement.css';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', email: '', role: 'USER' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get('/admin/users');
    setUsers(res.data);
  };

  const handleCreate = async () => {
    await axios.post('/admin/users', newUser);
    fetchUsers();
    setNewUser({ username: '', email: '', role: 'USER' });
  };

  const handleUpdate = async () => {
    await axios.put(`/admin/users/${selectedUser.id}`, selectedUser);
    setSelectedUser(null);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  const handleAssignRole = async (id, role) => {
    await axios.put(`/admin/users/assign-role/${id}?role=${role}`);
    fetchUsers();
  };

  const filteredUsers = users.filter(user => {
    const match =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = filter === 'All' || user.role === filter;
    return match && roleMatch;
  });

  return (
    <div className="admin-user-management">
      <h2>User Management</h2>

      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by username or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="create-user">
        <h3>Create New User</h3>
        <input placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
        <input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button onClick={handleCreate}>Create</button>
      </div>

      <div className="user-list">
        {filteredUsers.map((user) => (
          <div className="user-card" key={user.id}>
            <p><strong>{user.username}</strong> ({user.email})</p>
            <p>Role: {user.role}</p>
            <button onClick={() => setSelectedUser(user)}>Edit</button>
            <button onClick={() => handleDelete(user.id)}>Delete</button>
            <button onClick={() => handleAssignRole(user.id, user.role === 'USER' ? 'ADMIN' : 'USER')}>
              Make {user.role === 'USER' ? 'Admin' : 'User'}
            </button>
          </div>
        ))}
      </div>

      {selectedUser && (
        <div className="edit-user">
          <h3>Edit User</h3>
          <input value={selectedUser.username} onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })} />
          <input value={selectedUser.email} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />
          <select value={selectedUser.role} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button onClick={handleUpdate}>Save Changes</button>
          <button onClick={() => setSelectedUser(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
