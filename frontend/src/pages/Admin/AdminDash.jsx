import React, { useState } from "react";
import "./AdminDash.css";

import Navbar from "@/components/Navbar";
import AccountsTable from "../../components/AccountsTable";

export default function AdminDash() {
  return (
    <>
      <Navbar isAdmin />

      <div className="admin-dash">
        <h1>Admin Dashboard</h1>
        <AccountsTable />
      </div>
    </>
  );
}
