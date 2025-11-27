// src/features/admin/users/UserDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import adminAPI from "../../../services/adminAPI";

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    adminAPI.getUser(id)
      .then(setUser)
      .catch(() => setUser(null));
  }, [id]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">{user.name}</h3>
      <p>Email: {user.email}</p>
      <p>Orders: {user.orderCount}</p>
      <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  );
}
