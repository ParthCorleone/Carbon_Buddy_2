"use client";

import { useState, useEffect } from 'react';
import {
    TrendingUp, Sun, PieChart as PieIcon, Target
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";

const COLORS = ["#4CAF50", "#81C784", "#AED581", "#C5E1A5"];

type TodayEmissions = {
    transportEmissions?: number;
    energyEmissions?: number;
    foodEmissions?: number;
    digitalEmissions?: number;
    totalEmissions?: number;
};

interface ChartsViewProps {
    allEntries?: { date: string; totalEmissions: number }[];
    todayEmissions?: TodayEmissions;
    thisMonthTotal?: number;
    lastMonthTotal?: number;
}

const ChartsView = ({
    allEntries = [],
    todayEmissions = {},
    thisMonthTotal = 0,
    lastMonthTotal = 0,
}: ChartsViewProps) => {

    const [activeChart, setActiveChart] = useState('weekly');
    const chartOptions = [
        { name: 'Trend', id: 'weekly', icon: <TrendingUp /> },
        { name: 'Daily Progress', id: 'daily', icon: <Sun /> },
        { name: 'Category Breakdown', id: 'category', icon: <PieIcon /> },
        { name: 'Monthly', id: 'goal', icon: <Target /> },
    ];

    const weeklyData = allEntries.map((e) => ({
        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        emission: e.totalEmissions,
    }));

    const breakdownData = [
        { name: 'Transport', value: Number(todayEmissions?.transportEmissions ?? 0) / Number(todayEmissions?.totalEmissions ?? 0) * 100 || 0 },
        { name: 'Energy', value: Number(todayEmissions?.energyEmissions ?? 0) / Number(todayEmissions?.totalEmissions ?? 0) * 100 || 0 },
        { name: 'Food', value: Number(todayEmissions?.foodEmissions ?? 0) / Number(todayEmissions?.totalEmissions ?? 0) * 100 || 0 },
        { name: 'Digital', value: Number(todayEmissions?.digitalEmissions ?? 0) / Number(todayEmissions?.totalEmissions ?? 0) * 100 || 0 },
    ];

    const goalData = [
        { name: 'This Month', value: (thisMonthTotal).toFixed(2) },
        { name: 'Last Month', value: (lastMonthTotal).toFixed(2) },
    ];
    
    const renderChart = () => {
        switch (activeChart) {
            case 'weekly':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={[...weeklyData].reverse().map(entry => ({ ...entry, emission: Number(entry.emission.toFixed(2)) }))}>
                            <CartesianGrid strokeDasharray="5 5" />
                            <XAxis dataKey="date" tick={{ fill: "#4CAF50", fontWeight: 'bold' }} />
                            <YAxis tick={{ fill: "#4CAF50", fontWeight: 'bold' }} />
                            <Tooltip contentStyle={{ backgroundColor: "#f9f9f9", borderRadius: "8px" }} />
                            <Line type="monotone" dataKey="emission" stroke="#4CAF50" strokeWidth={3} dot={{ r: 5, fill: "#4CAF50" }} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'daily':
                return (
                    <div className="flex flex-col items-center justify-center h-full py-8 bg-green-50 rounded-lg shadow-inner">
                        <p className="text-5xl font-bold text-green-600">{(todayEmissions?.totalEmissions ?? 0).toFixed(2)} kg</p>
                        <p className="text-gray-600 mt-2 text-lg">Total emissions today</p>
                    </div>
                );
            case 'category':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={breakdownData}
                                dataKey="value"
                                cx="50%"
                                cy="50%"
                                outerRadius="80%"
                                fill="#82ca9d"
                                label={({ name, value }) => `${name}: ${value !== undefined ? value.toFixed(2) : "0.00"}%`}
                            >
                                {breakdownData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                );
            case 'goal':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={goalData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fill: "#4CAF50", fontWeight: 'bold' }} />
                            <YAxis tick={{ fill: "#4CAF50", fontWeight: 'bold' }} />
                            <Tooltip contentStyle={{ backgroundColor: "#f9f9f9", borderRadius: "8px" }} />
                            <Bar dataKey="value" fill="#16a34a" barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            default:
                return <p className="text-gray-500">No chart selected</p>;
        }
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md animate-fade-in">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Emission Trends</h2>
                <p className="text-gray-600">Your carbon footprint over time</p>
            </div>
            <div className="flex flex-wrap border-b mb-4">
                {chartOptions.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => setActiveChart(opt.id)}
                        className={`flex items-center space-x-2 px-3 py-2 -mb-px rounded-t-lg font-semibold transition-colors ${activeChart === opt.id
                            ? "bg-green-100 text-green-700 border-b-2 border-green-500"
                            : "text-gray-500 hover:bg-gray-100"
                            }`}
                    >
                        {opt.icon}
                        <span>{opt.name}</span>
                    </button>
                ))}
            </div>
            <div className="mt-4 p-6 bg-gray-50 rounded-lg w-full max-w-full">
                {renderChart()}
            </div>
        </div>
    );
};

export default ChartsView;