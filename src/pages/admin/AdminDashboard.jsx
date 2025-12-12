// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import adminAPI from "../../services/adminAPI";
import AdminCard from "../../components/Admin/AdminCard";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    adminAPI.getStats().then(d => {
      setStats(d);
      setChartData(d.revenueSeries || []);
    }).catch(()=> {
      // fallback mock
      setStats({ totalSales: "—", totalOrders: "—", totalCustomers: "—", totalProducts: "—" });
      setChartData([{ day: "Mon", value: 200 }, { day: "Tue", value: 400 }]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <AdminCard title="Total Sales" value={stats.totalSales ?? "—"} />
        <AdminCard title="Total Orders" value={stats.totalOrders ?? "—"} />
        <AdminCard title="Total Customers" value={stats.totalCustomers ?? "—"} />
        <AdminCard title="Total Products" value={stats.totalProducts ?? "—"} />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Revenue (last 7 days)</h3>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}><XAxis dataKey="day"/><YAxis/><Tooltip/><Line dataKey="value" stroke="#4f46e5" /></LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}