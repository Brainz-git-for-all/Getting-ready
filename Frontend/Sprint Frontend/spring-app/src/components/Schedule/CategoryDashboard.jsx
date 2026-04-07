import React, { useState, useEffect } from 'react';
import { categoryService } from '../../api';

const CategoryDashboard = ({ userId, onBack }) => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#4f46e5');

    const load = () => {
        categoryService.getAllByUser(userId).then(res => setCategories(res.data));
    };

    useEffect(() => { load(); }, [userId]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await categoryService.create({ name, color, userId });
            setName('');
            load();
        } catch (err) { alert("Error creating category"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Deleting this category may affect schedule blocks. Proceed?")) {
            await categoryService.delete(id);
            load();
        }
    };

    return (
        <div className="habit-container">
            <header className="main-header">
                <h1>Categories</h1>
                <button className="btn-secondary" onClick={onBack}>Back to Schedule</button>
            </header>

            <form className="form-card" onSubmit={handleCreate} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                        <label>New Category Name</label>
                        <input
                            type="text"
                            className="habit-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g., Deep Work"
                            required
                        />
                    </div>
                    <div className="form-group" style={{ flex: 0, marginBottom: 0 }}>
                        <label>Color</label>
                        <input
                            type="color"
                            value={color}
                            onChange={e => setColor(e.target.value)}
                            style={{ height: '42px', width: '60px', padding: '2px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ height: '42px' }}>Add</button>
                </div>
            </form>

            <div className="table-wrapper">
                <table className="sprint-table">
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th>Color Preview</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(c => (
                            <tr key={c.id}>
                                <td style={{ fontWeight: 600 }}>{c.name}</td>
                                <td>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '8px'
                                    }}>
                                        <div style={{ width: '24px', height: '24px', backgroundColor: c.color, borderRadius: '50%' }}></div>
                                        {c.color}
                                    </div>
                                </td>
                                <td>
                                    <button className="btn-delete" onClick={() => handleDelete(c.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryDashboard;