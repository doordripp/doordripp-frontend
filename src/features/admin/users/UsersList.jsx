// src/features/admin/users/UsersList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminAPI from "../../../services/adminAPI";

export default function UsersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    adminAPI.getUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Users</h3>
      <div className="bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <Link 
                    to={`/admin/users/${u._id}`} 
                    className="text-blue-600"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
