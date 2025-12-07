import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DashboardCharts.css';

const RevenueChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="chart-container">
                <h3>Gelir Trendi (Son 30 Gün)</h3>
                <div className="no-data">Henüz veri yok</div>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <h3>Gelir Trendi (Son 30 Gün)</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `€${value}`} />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4caf50"
                        strokeWidth={2}
                        dot={{ fill: '#4caf50' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
