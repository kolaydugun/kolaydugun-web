import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './DashboardCharts.css';

const LeadsChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="chart-container">
                <h3>Lead İstatistikleri (Son 7 Gün)</h3>
                <div className="no-data">Henüz veri yok</div>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <h3>Lead İstatistikleri (Son 7 Gün)</h3>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="new" fill="#2196f3" name="Yeni" />
                    <Bar dataKey="won" fill="#4caf50" name="Kazanılan" />
                    <Bar dataKey="lost" fill="#f44336" name="Kaybedilen" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LeadsChart;
