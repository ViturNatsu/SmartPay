import React, { useState } from "react";
import "./AdminDash.css";

import Navbar from "@/components/Navbar";
import AccountsTable from "../../components/AccountsTable";
import {BasicPageLayout} from "@/components/customComponents/pageLayout/BasicPageLayout.jsx";

export default function AdminDash() {
  return (
    <BasicPageLayout
      title="Admin Dashboard"
      subtitle="UNDER CONSTRUCTION"
    >
      <div className="admin-dash">
        <AccountsTable />
      </div>
    </BasicPageLayout>
  );
}
