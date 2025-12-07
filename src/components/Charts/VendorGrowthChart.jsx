import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DashboardCharts.css';

const VendorGrowthChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="chart-container">
                <h3>Vendor Büyümesi (Son 3 Ay)</h3>
                <div className="no-data">Henüz veri yok</div>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <h3>Vendor Büyümesi (Son 3 Ay)</h3>
            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#9c27b0"
                        fill="#e1bee7"
                        name="Toplam Vendor"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default VendorGrowthChart;
