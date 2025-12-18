import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { usePageTitle } from '../hooks/usePageTitle';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Users, Store, Heart, ShieldCheck, Activity, Search, TrendingUp, AlertCircle } from 'lucide-react';
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
        topPages: [],
        googleData: {
            totalUsers: 0,
            newUsers: 0,
            sessions: 0,
            bounceRate: 0,
            topKeywords: [],
            lastUpdate: null
        }
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

                // Top vendors by lead count (from vendor_leads)
                const { data: leadCounts, error: leadError } = await supabase
                    .from('vendor_leads')
                    .select('vendor_id');

                if (leadError) console.error("Lead fetch error:", leadError);

                const vendorLeadMap = {};
                leadCounts?.forEach(lead => {
                    if (lead.vendor_id) {
                        vendorLeadMap[lead.vendor_id] = (vendorLeadMap[lead.vendor_id] || 0) + 1;
                    }
                });

                // Fetch business names for these vendors
                const topVendorIds = Object.keys(vendorLeadMap);
                let topVendorsData = [];

                if (topVendorIds.length > 0) {
                    const { data: vendorNames } = await supabase
                        .from('vendors')
                        .select('id, business_name')
                        .in('id', topVendorIds);

                    topVendorsData = Object.entries(vendorLeadMap)
                        .map(([vendorId, count]) => ({
                            vendorId,
                            businessName: vendorNames?.find(v => v.id === vendorId)?.business_name || 'Bilinmiyor',
                            leadCount: count
                        }))
                        .sort((a, b) => b.leadCount - a.leadCount)
                        .slice(0, 5);
                } else {
                    // Fallback to newest vendors if no lead data
                    const { data: newestVendors } = await supabase
                        .from('vendors')
                        .select('id, business_name')
                        .is('deleted_at', null)
                        .order('created_at', { ascending: false })
                        .limit(5);

                    topVendorsData = newestVendors?.map(v => ({
                        vendorId: v.id,
                        businessName: v.business_name || 'Bilinmiyor',
                        leadCount: null,
                        isNew: true
                    })) || [];
                }

                setStats(prev => ({
                    ...prev,
                    totalUsers: data.totalUsers || 0,
                    vendors: data.vendors || 0,
                    couples: data.couples || 0,
                    admins: data.admins || 0,
                    recentUsers: data.recentUsers || [],
                    topVendors: topVendorsData,
                    userGrowth: formattedGrowth,
                    activeUsers: 0,
                    recentSessions: [],
                    topPages: []
                }));

                // Fetch Active Users (last 5 minutes)
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
                const { count: activeCount } = await supabase
                    .from('user_sessions')
                    .select('*', { count: 'exact', head: true })
                    .gt('last_activity', fiveMinutesAgo)
                    .filter('session_end', 'is', null);

                // Fetch Recent Sessions
                const { data: sessionData, error: sessionError } = await supabase
                    .from('user_sessions')
                    .select('*')
                    .order('last_activity', { ascending: false })
                    .limit(10);

                if (sessionError) console.error("Session fetch error:", sessionError);

                // Fetch profiles forThese sessions manually to avoid join issues
                let enhancedSessions = [];
                if (sessionData?.length > 0) {
                    const userIds = [...new Set(sessionData.map(s => s.user_id).filter(Boolean))];
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, full_name, role')
                        .in('id', userIds);

                    enhancedSessions = sessionData.map(session => ({
                        ...session,
                        profiles: profiles?.find(p => p.id === session.user_id) || null
                    }));
                }

                // Fetch Top Pages
                const { data: pageData } = await supabase
                    .from('page_views')
                    .select('page_path, page_title')
                    .order('viewed_at', { ascending: false })
                    .limit(200);

                // Aggregate top pages
                const pageCounts = {};
                pageData?.forEach(page => {
                    const key = page.page_title || page.page_path;
                    if (key) {
                        pageCounts[key] = (pageCounts[key] || 0) + 1;
                    }
                });

                const sortedPages = Object.entries(pageCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                setStats(prev => ({
                    ...prev,
                    activeUsers: activeCount || 0,
                    recentSessions: enhancedSessions,
                    topPages: sortedPages
                }));

                // 2. Fetch Google API Snapshots (Optional, don't crash if table missing)
                try {
                    const { data: googleSnapshots, error: googleError } = await supabase
                        .from('google_analytics_snapshots')
                        .select('*')
                        .order('snapshot_date', { ascending: false })
                        .limit(1); // Use limit instead of single to avoid error when empty

                    if (!googleError && googleSnapshots && googleSnapshots.length > 0) {
                        const latest = googleSnapshots[0];
                        setStats(prev => ({
                            ...prev,
                            googleData: {
                                totalUsers: latest.total_users,
                                newUsers: latest.new_users,
                                sessions: latest.sessions,
                                bounceRate: latest.bounce_rate,
                                topKeywords: latest.top_keywords || [],
                                lastUpdate: latest.snapshot_date
                            }
                        }));
                    }
                } catch (err) {
                    console.error('Google snapshots fetch skipped or table missing:', err);
                }
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

    // Chart Colors
    const COLORS = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#6366f1'];

    return (
        <div className="section container admin-analytics-container">
            <div className="admin-analytics-header">
                <div className="header-title-group">
                    <h1>📊 Yönetim Paneli Analitikleri</h1>
                    <p>Platform performansını ve kullanıcı davranışlarını gerçek zamanlı takip edin.</p>
                </div>
                <button className="refresh-btn" onClick={fetchAnalytics}>
                    🔄 Yenile
                </button>
            </div>

            {/* User Stats Grid */}
            <div className="analytics-stats-grid">
                <div className="analytics-stat-card-v2 primary">
                    <div className="card-header">
                        <Users className="card-icon" />
                        <span className="card-label">Toplam Kullanıcı</span>
                    </div>
                    <div className="card-body">
                        <h2 className="card-value">{stats.totalUsers}</h2>
                        <div className="card-trend up">
                            <TrendingUp className="trend-icon" /> <span>+{stats.recentUsers.length} yeni</span>
                        </div>
                    </div>
                </div>

                <div className="analytics-stat-card-v2 pink">
                    <div className="card-header">
                        <Store className="card-icon" />
                        <span className="card-label">İşletmeler (Vendor)</span>
                    </div>
                    <div className="card-body">
                        <h2 className="card-value">{stats.vendors}</h2>
                        <div className="card-percentage">Toplamın %{((stats.vendors / stats.totalUsers) * 100).toFixed(1)}'i</div>
                    </div>
                </div>

                <div className="analytics-stat-card-v2 green">
                    <div className="card-header">
                        <Heart className="card-icon" />
                        <span className="card-label">Çiftler</span>
                    </div>
                    <div className="card-body">
                        <h2 className="card-value">{stats.couples}</h2>
                        <div className="card-percentage">Toplamın %{((stats.couples / stats.totalUsers) * 100).toFixed(1)}'i</div>
                    </div>
                </div>

                <div className="analytics-stat-card-v2 orange">
                    <div className="card-header">
                        <ShieldCheck className="card-icon" />
                        <span className="card-label">Yöneticiler</span>
                    </div>
                    <div className="card-body">
                        <h2 className="card-value">{stats.admins}</h2>
                    </div>
                </div>

                <div className="analytics-stat-card-v2 red active">
                    <div className="card-header">
                        <Activity className="card-icon" />
                        <span className="card-label">Aktif Kullanıcılar (5dk)</span>
                    </div>
                    <div className="card-body">
                        <h2 className="card-value">{stats.activeUsers}</h2>
                        <span className="status-indicator live"></span>
                    </div>
                </div>
            </div>

            <div className="charts-main-grid">
                {/* User Growth Chart */}
                <div className="analytics-chart-card">
                    <div className="chart-header">
                        <h3>📈 Kullanıcı Kayıt Trendi (Son 7 Gün)</h3>
                    </div>
                    <div className="chart-container" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.userGrowth}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    cursor={{ stroke: '#ec4899', strokeWidth: 1 }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Page Views Pie Chart */}
                <div className="analytics-chart-card">
                    <div className="chart-header">
                        <h3>🧩 Trafik Dağılımı (Popüler Sayfalar)</h3>
                    </div>
                    <div className="chart-container" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.topPages}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {stats.topPages.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pie-legend">
                            {stats.topPages.map((page, index) => (
                                <div key={index} className="legend-item">
                                    <span className="dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    <span className="label">{page.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout: Recent Users & Top Vendors */}
            <div className="analytics-two-column">
                <div className="analytics-section">
                    <div className="section-header">
                        <Users className="section-icon" />
                        <h2>🆕 Son Kayıt Olanlar</h2>
                    </div>
                    <div className="analytics-table">
                        {stats.recentUsers.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Kullanıcı</th>
                                        <th>Rol</th>
                                        <th>Tarih</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="cell-main">{user.name || 'İsimsiz'}</div>
                                                <div className="cell-sub">{user.email}</div>
                                            </td>
                                            <td>
                                                <span className={`role-badge ${user.role}`}>
                                                    {user.role === 'vendor' ? '🏪 Vendor' :
                                                        user.role === 'couple' ? '💑 Çift' : '👑 Admin'}
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

                <div className="analytics-section">
                    <div className="section-header">
                        <TrendingUp className="section-icon" />
                        <h2>🏆 {stats.topVendors[0]?.leadCount > 0 ? "En Aktif Vendorlar" : "Yeni Katılan Vendorlar"}</h2>
                    </div>
                    <div className="analytics-table">
                        {stats.topVendors.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Sıra</th>
                                        <th>İşletme</th>
                                        <th>Lead</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topVendors.map((vendor, index) => (
                                        <tr key={vendor.vendorId}>
                                            <td><span className="rank-badge">#{index + 1}</span></td>
                                            <td className="font-semibold">{vendor.businessName}</td>
                                            <td>
                                                {vendor.isNew ? (
                                                    <span className="status-tag online" style={{ fontSize: '0.7rem' }}>Yeni</span>
                                                ) : (
                                                    <div className="lead-count-badge">
                                                        {vendor.leadCount} <span>lead</span>
                                                    </div>
                                                )}
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

            {/* Session Analytics */}
            <div className="analytics-two-column">
                <div className="analytics-section">
                    <div className="section-header">
                        <Activity className="section-icon" />
                        <h2>🕒 Son Oturumlar</h2>
                    </div>
                    <div className="analytics-table">
                        {stats.recentSessions.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Kullanıcı</th>
                                        <th>Zaman</th>
                                        <th>Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentSessions.map(session => {
                                        const isOnline = new Date(session.last_activity) > new Date(Date.now() - 5 * 60 * 1000);
                                        return (
                                            <tr key={session.id}>
                                                <td>
                                                    <div className="cell-main">
                                                        {session.profiles?.full_name || (
                                                            <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                                                                Misafir {session.user_agent ? `(${session.user_agent.split(' ')[0]})` : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="cell-sub">{session.profiles?.role || 'User'}</div>
                                                </td>
                                                <td className="cell-sub">{new Date(session.last_activity).toLocaleTimeString('tr-TR')}</td>
                                                <td>
                                                    <div className={`status-tag ${isOnline ? 'online' : 'offline'}`}>
                                                        {isOnline ? 'Aktif' : 'Çevrimdışı'}
                                                    </div>
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

                <div className="analytics-section">
                    <div className="section-header">
                        <Search className="section-icon" />
                        <h2>🌐 Popüler Sayfalar</h2>
                    </div>
                    <div className="analytics-table">
                        {stats.topPages.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Sayfa Başlığı</th>
                                        <th>Görüntülenme</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topPages.map((page, index) => (
                                        <tr key={index}>
                                            <td className="cell-main truncate-text">{page.name}</td>
                                            <td>
                                                <div className="view-count">{page.count}</div>
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

            {/* Phase 2: Google Analytics & SEO Insights */}
            <div className="analytics-section google-dashboard-card">
                <div className="google-header">
                    <div className="google-title">
                        <Search className="google-icon" />
                        <h2>Google SEO & Trafik Analizleri</h2>
                    </div>
                    {stats.googleData.lastUpdate && (
                        <div className="last-sync-badge">
                            Son Senkronizasyon: {new Date(stats.googleData.lastUpdate).toLocaleDateString('tr-TR')}
                        </div>
                    )}
                </div>

                {!stats.googleData.lastUpdate ? (
                    <div className="google-setup-notice">
                        <AlertCircle className="notice-icon" />
                        <div className="notice-content">
                            <h4>Veri Eşitleme Bekleniyor</h4>
                            <p>Google verileri henüz senkronize edilmedi. Veriler her gece otomatik olarak güncellenir.</p>
                        </div>
                    </div>
                ) : (
                    <div className="google-content-grid">
                        <div className="google-metrics-grid">
                            <div className="google-mini-card">
                                <span className="label">Kullanıcılar</span>
                                <span className="value">{stats.googleData.totalUsers}</span>
                            </div>
                            <div className="google-mini-card">
                                <span className="label">Oturumlar</span>
                                <span className="value">{stats.googleData.sessions}</span>
                            </div>
                            <div className="google-mini-card">
                                <span className="label">Hemen Çıkma</span>
                                <span className="value">%{stats.googleData.bounceRate}</span>
                            </div>
                        </div>

                        <div className="google-insights-box">
                            <h4>🔑 En Popüler Anahtar Kelimeler</h4>
                            <div className="keywords-cloud">
                                {stats.googleData.topKeywords.length > 0 ? (
                                    stats.googleData.topKeywords.map((kw, i) => (
                                        <span key={i} className="keyword-tag">{kw.word}</span>
                                    ))
                                ) : (
                                    <span className="no-data">Veri yok.</span>
                                )}
                            </div>
                        </div>

                        <div className="google-ai-box">
                            <div className="ai-box-header">
                                <Activity className="ai-icon" />
                                <h4>AI SEO Analizi</h4>
                            </div>
                            <div className="ai-box-content">
                                {stats.googleData.bounceRate > 60 && (
                                    <div className="ai-alert-item error">
                                        <strong>⚠️ Hemen Çıkma Oranı Yüksek:</strong> Sayfa hızını ve mobil uyumluluğu kontrol edin.
                                    </div>
                                )}
                                <div className="ai-alert-item tip">
                                    <strong>💡 Trend Fırsatı:</strong> "{stats.googleData.topKeywords?.[0]?.word || 'Düğün'}" kelimesinde görünürlüğünüz artıyor. Bu alanda daha fazla içerik üretin.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnalytics;
