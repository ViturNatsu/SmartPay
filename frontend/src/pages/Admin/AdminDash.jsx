import React, { useState } from 'react';
import './AdminDash.css';

import Navbar from "@/components/Navbar"

export default function AdminDash() {
    const [accounts, setAccounts] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', balance: 5000 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active', balance: 3500 },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive', balance: 1200 },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', status: 'Active', balance: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            setAccounts(accounts.map(acc => acc.id === editingId ? { ...acc, ...formData } : acc));
        } else {
            setAccounts([...accounts, { id: Date.now(), ...formData, balance: parseFloat(formData.balance) }]);
        }
        setFormData({ name: '', email: '', status: 'Active', balance: '' });
        setShowForm(false);
        setEditingId(null);
    };

    const handleEdit = (account) => {
        setFormData(account);
        setEditingId(account.id);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        setAccounts(accounts.filter(acc => acc.id !== id));
    };

    return (
        <>
            <Navbar isAdmin />
            <div className="admin-dash">
                <h1>Admin Dashboard</h1>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ New Account'}
                </button>

                {showForm && (
                    <form className="form-container" onSubmit={handleSubmit}>
                        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
                        <select name="status" value={formData.status} onChange={handleInputChange}>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                        <input type="number" name="balance" placeholder="Balance" value={formData.balance} onChange={handleInputChange} required />
                        <button type="submit" className="btn-submit">{editingId ? 'Update' : 'Create'}</button>
                    </form>
                )}

                <table className="accounts-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Balance</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map(account => (
                            <tr key={account.id}>
                                <td>{account.name}</td>
                                <td>{account.email}</td>
                                <td><span className={`status ${account.status.toLowerCase()}`}>{account.status}</span></td>
                                <td>${account.balance}</td>
                                <td>
                                    <button className="btn-edit" onClick={() => handleEdit(account)}>Edit</button>
                                    <button className="btn-delete" onClick={() => handleDelete(account.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}