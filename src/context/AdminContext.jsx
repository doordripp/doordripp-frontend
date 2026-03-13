// src/context/AdminContext.jsx
import React, { createContext, useContext, useState } from "react";
const AdminContext = createContext();
export const AdminProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return <AdminContext.Provider value={{ sidebarOpen, setSidebarOpen }}>{children}</AdminContext.Provider>;
};
export const useAdmin = () => useContext(AdminContext);