import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './AdminPages.css';

const AdminPages = () => {
    const { t } = useLanguage();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .order('slug');

            if (error) throw error;
            setPages(data || []);
        } catch (error) {
            console.error('Error fetching pages:', error);
            alert('Error loading pages');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        // Confirmation dialog removed to prevent interaction issues
        // if (!window.confirm('Are you sure you want to delete this page?')) return;

        try {
            // Use RPC function to bypass RLS issues
            const { data, error } = await supabase.rpc('delete_page_admin', { page_id: id });

            if (error) {
                console.error('RPC Error:', error);
                alert('Error deleting page: ' + error.message);
                return;
            }

            if (data && data.success === false) {
                alert('Delete failed: ' + (data.error || 'Unknown error'));
                return;
            }

            // Update local state
            setPages(pages.filter(p => p.id !== id));
            alert('✅ Page deleted successfully.');

        } catch (error) {
            console.error('Error deleting page:', error);
            alert('Error deleting page: ' + error.message);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="admin-pages-container" style={{ paddingTop: '120px', paddingBottom: '50px' }}>
            <div className="admin-header">
                <h1>Page Management</h1>
                <Link to="/admin/pages/new" className="btn btn-primary">
                    + New Page
                </Link>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Slug</th>
                            <th>Title (EN)</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map(page => (
                            <tr key={page.id}>
                                <td><code>/{page.slug}</code></td>
                                <td>{page.title?.en || '-'}</td>
                                <td>
                                    <span className={`status-badge ${page.is_active ? 'active' : 'inactive'}`}>
                                        {page.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{new Date(page.updated_at).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    <Link to={`/admin/pages/edit/${page.id}`} className="btn-icon" title="Edit">
                                        ✏️
                                    </Link>
                                    <button onClick={() => handleDelete(page.id)} className="btn-icon delete" title="Delete">
                                        🗑️
                                    </button>
                                    <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer" className="btn-icon" title="View">
                                        👁️
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {pages.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center">No pages found. Create one!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPages;
