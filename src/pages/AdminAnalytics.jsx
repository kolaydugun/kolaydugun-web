import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
    usePageTitle('Analytics - Admin');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        vendors: 0,
        couples: 0,
        admins: 0,
        recentUsers: [],
        topVendors: [],
        userGrowth: [],
        activeUsers: 0,
        recentSessions: [],
        topPages: []
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);

        try {
            // Call the RPC function to get all analytics data
            const { data, error } = await supabase.rpc('get_admin_analytics');

            if (error) throw error;

            if (data) {
                // Format user growth labels
                const formattedGrowth = data.userGrowth?.map(item => ({
                    ...item,
                    label: new Date(item.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })
                })) || [];

                // Fetch top vendors separately as it involves joining with leads table which is complex in RPC
                // or we can keep the existing logic for top vendors if the RPC doesn't handle it.
                // The RPC I wrote didn't include top vendors logic fully (it just did user stats).
                // Let's keep the top vendors logic here for now or add it to RPC.
                // For simplicity, I'll keep top vendors logic here as it works fine.

                // Top vendors by lead count
                const { data: leadCounts } = await supabase
                    .from('leads')
                    .select('vendor_id, vendor_profiles(business_name)');

                const vendorLeadMap = {};
                leadCounts?.forEach(lead => {
                    if (lead.vendor_id) {
                        vendorLeadMap[lead.vendor_id] = (vendorLeadMap[lead.vendor_id] || 0) + 1;
                    }
                });

                const topVendors = Object.entries(vendorLeadMap)
                    .map(([vendorId, count]) => {
                        const vendorData = leadCounts.find(l => l.vendor_id === vendorId);
                        return {
                            vendorId,
                            businessName: vendorData?.vendor_profiles?.business_name || 'Unknown',
                            leadCount: count
                        };
                    })
                    .sort((a, b) => b.leadCount - a.leadCount)
                    .slice(0, 5);

                setStats({
                    totalUsers: data.totalUsers || 0,
                    vendors: data.vendors || 0,
                    couples: data.couples || 0,
                    admins: data.admins || 0,
                    recentUsers: data.recentUsers || [],
                    topVendors: topVendors,
                    userGrowth: formattedGrowth,
                    activeUsers: 0, // Will be updated below
                    recentSessions: [],
                    topPages: []
                });

                // Fetch Active Users (last 5 minutes)
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
                const { count: activeCount } = await supabase
                    .from('user_sessions')
                    .select('*', { count: 'exact', head: true })
                    .gt('last_activity', fiveMinutesAgo)
                    .is('session_end', null);

                // Fetch Recent Sessions
                const { data: recentSessions } = await supabase
                    .from('user_sessions')
                    .select('*, users(email, raw_user_meta_data)')
                    .order('last_activity', { ascending: false })
                    .limit(10);

                // Fetch Top Pages
                const { data: topPages } = await supabase
                    .from('page_views')
                    .select('page_path, page_title')
                    .order('viewed_at', { ascending: false })
                    .limit(100);

                // Aggregate top pages
                const pageCounts = {};
                topPages?.forEach(page => {
                    const key = page.page_title || page.page_path;
                    pageCounts[key] = (pageCounts[key] || 0) + 1;
                });

                const sortedPages = Object.entries(pageCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                setStats(prev => ({
                    ...prev,
                    activeUsers: activeCount || 0,
                    recentSessions: recentSessions || [],
                    topPages: sortedPages
                }));
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const maxGrowth = Math.max(...stats.userGrowth.map(d => d.count), 1);

    return (
        <div className="section container admin-analytics-container">
            <div className="admin-analytics-header">
                <h1>📊 Kullanıcı Analitiği</h1>
                <p>Kayıtlı kullanıcılar ve aktivite özeti</p>
            </div>

            {/* User Stats */}
            <div className="analytics-stats-grid">
                <div className="analytics-stat-card total">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>Toplam Kullanıcı</h3>
                        <p className="stat-number">{stats.totalUsers}</p>
                    </div>
                </div>

                <div className="analytics-stat-card vendors">
                    <div className="stat-icon">🏪</div>
                    <div className="stat-content">
                        <h3>Vendor</h3>
                        <p className="stat-number">{stats.vendors}</p>
                    </div>
                </div>

                <div className="analytics-stat-card couples">
                    <div className="stat-icon">💑</div>
                    <div className="stat-content">
                        <h3>Çiftler</h3>
                        <p className="stat-number">{stats.couples}</p>
                    </div>
                </div>

                <div className="analytics-stat-card admins">
                    <div className="stat-icon">👑</div>
                    <div className="stat-content">
                        <h3>Admin</h3>
                        <p className="stat-number">{stats.admins}</p>
                    </div>
                </div>

                <div className="analytics-stat-card active-users">
                    <div className="stat-icon">🟢</div>
                    <div className="stat-content">
                        <h3>Aktif Kullanıcılar</h3>
                        <p className="stat-number">{stats.activeUsers}</p>
                    </div>
                </div>
            </div>

            {/* User Growth Chart */}
            <div className="analytics-section">
                <h2>📈 Son 7 Gün Kayıt Trendi</h2>
                <div className="growth-chart">
                    {stats.userGrowth.map((day, index) => (
                        <div key={index} className="chart-bar-container">
                            <div
                                className="chart-bar"
                                style={{
                                    height: `${(day.count / maxGrowth) * 100}%`,
                                    minHeight: day.count > 0 ? '20px' : '5px'
                                }}
                            >
                                <span className="bar-value">{day.count}</span>
                            </div>
                            <span className="bar-label">{day.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="analytics-two-column">
                {/* Recent Users */}
                <div className="analytics-section">
                    <h2>🆕 Son Kayıt Olanlar</h2>
                    <div className="analytics-table">
                        {stats.recentUsers.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>İsim</th>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Tarih</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.name || '-'}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`role-badge ${user.role}`}>
                                                    {user.role === 'vendor' ? '🏪 Vendor' :
                                                        user.role === 'couple' ? '💑 Çift' :
                                                            '👑 Admin'}
                                                </span>
                                            </td>
                                            <td>{new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="empty-state">Henüz kullanıcı yok.</p>
                        )}
                    </div>
                </div>

                {/* Top Vendors */}
                <div className="analytics-section">
                    <h2>🏆 En Aktif Vendor'lar</h2>
                    <div className="analytics-table">
                        {stats.topVendors.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>İşletme</th>
                                        <th>Lead Sayısı</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topVendors.map((vendor, index) => (
                                        <tr key={vendor.vendorId}>
                                            <td>
                                                <span className="rank-badge">#{index + 1}</span>
                                                {vendor.businessName}
                                            </td>
                                            <td>
                                                <strong>{vendor.leadCount}</strong> lead
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="empty-state">Henüz lead yok.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Session Analytics */}
            <div className="analytics-two-column" style={{ marginTop: '2rem' }}>
                {/* Recent Sessions */}
                <div className="analytics-section">
                    <h2>🕒 Son Aktiviteler</h2>
                    <div className="analytics-table">
                        {stats.recentSessions.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Kullanıcı</th>
                                        <th>Son İşlem</th>
                                        <th>Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentSessions.map(session => {
                                        const isOnline = new Date(session.last_activity) > new Date(Date.now() - 5 * 60 * 1000);
                                        return (
                                            <tr key={session.id}>
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>
                                                        {session.users?.raw_user_meta_data?.full_name || 'Misafir'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                        {session.users?.email}
                                                    </div>
                                                </td>
                                                <td>{new Date(session.last_activity).toLocaleTimeString('tr-TR')}</td>
                                                <td>
                                                    {isOnline ? (
                                                        <span style={{ color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                                            <span className="online-indicator"></span> Çevrimiçi
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                                                            <span className="offline-indicator"></span> {new Date(session.session_end || session.last_activity).toLocaleDateString('tr-TR')}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p className="empty-state">Henüz aktivite yok.</p>
                        )}
                    </div>
                </div>

                {/* Top Pages */}
                <div className="analytics-section">
                    <h2>📄 En Çok Gezilen Sayfalar</h2>
                    <div className="analytics-table page-views-table">
                        {stats.topPages.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Sayfa</th>
                                        <th>Görüntülenme</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topPages.map((page, index) => (
                                        <tr key={index}>
                                            <td>
                                                <span className="rank-badge">#{index + 1}</span>
                                                {page.name}
                                            </td>
                                            <td>
                                                <strong>{page.count}</strong>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="empty-state">Henüz veri yok.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
