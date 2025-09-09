"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    BarChart as BarIcon, Droplet, Leaf, Footprints, Zap, Apple, Monitor,
    TrendingUp, Sun, PieChart as PieIcon, Target, ArrowUp, ArrowDown,
    Link
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";
import JSX from 'react/jsx-runtime';

const COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444"];

type SummaryCardProps = {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    unit: string;
    description: string;
    bgColor: string;
    trend?: 'up' | 'down' | 'none';
};

const SummaryCard = ({
    icon,
    title,
    value,
    unit,
    description,
    bgColor,
    trend = 'none'
}: SummaryCardProps) => {
    const isPositive = trend === 'up';
    const isNegative = trend === 'down';

    return (
        <div className={`rounded-2xl p-4 md:p-6 flex flex-col justify-between shadow-sm ${bgColor}`}>
            <div className="flex justify-between items-start">
                <p className="font-semibold text-gray-700">{title}</p>
                {icon}
            </div>
            <div>
                <div className="flex items-baseline">
                    <p className="text-3xl md:text-4xl font-bold text-gray-800">
                        {value}
                        <span className="text-xl font-semibold ml-1">{unit}</span>
                    </p>
                    {isPositive && <ArrowUp size={20} className="ml-2 text-green-600" />}
                    {isNegative && <ArrowDown size={20} className="ml-2 text-red-600" />}
                </div>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
        </div>
    );
};

type TodayEmissions = {
    carDistanceKms?: number;
    carType?: string;
    publicTransportKms?: number;
    flightKms?: number;
    cyclingWalkingKms?: number;
    officeHours?: number;
    emissionFactor?: number;
    electricityBill?: number;
    diet?: string;
    foodConsumed?: number;
    waterBottlesConsumed?: number;
    ateLocalOrSeasonalFood?: boolean;
    pagesPrinted?: number;
    videoCallHours?: number;
    cloudStorageGb?: number;
    transportEmissions?: number;
    energyEmissions?: number;
    foodEmissions?: number;
    digitalEmissions?: number;
    totalEmissions?: number;
};

const CalculatorView = ({ todayEmissions }: { todayEmissions?: TodayEmissions }) => {
    type TabId = 'transport' | 'energy' | 'food' | 'digital';

    const [activeTab, setActiveTab] = useState<TabId>('transport');
    const [formData, setFormData] = useState({
        transport: {
            carDistanceKms: todayEmissions?.carDistanceKms ?? 0,
            carType: todayEmissions?.carType ?? "PETROL",
            publicTransportKms: todayEmissions?.publicTransportKms ?? 0,
            flightKms: todayEmissions?.flightKms ?? 0,
            cyclingWalkingKms: todayEmissions?.cyclingWalkingKms ?? 0,
        },
        energy: {
            officeHours: todayEmissions?.officeHours ?? 0,
            emissionFactor: todayEmissions?.emissionFactor ?? 0,
            electricityBill: todayEmissions?.electricityBill ?? 0,
        },
        food: {
            diet: todayEmissions?.diet ?? "MIXED",
            foodConsumed: todayEmissions?.foodConsumed ?? 0,
            waterBottlesConsumed: todayEmissions?.waterBottlesConsumed ?? 0,
            ateLocalOrSeasonalFood: todayEmissions?.ateLocalOrSeasonalFood ?? false,
        },
        digital: {
            pagesPrinted: todayEmissions?.pagesPrinted ?? 0,
            videoCallHours: todayEmissions?.videoCallHours ?? 0,
            cloudStorageGb: todayEmissions?.cloudStorageGb ?? 0,
        },
    });

    const [added, setAdded] = useState<{ [K in TabId]?: boolean }>({
        transport: false,
        energy: false,
        food: false,
        digital: false,
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    // ✅ STEP 2: SYNC the form's state if `todayEmissions` changes after the initial render.
    // This is crucial for keeping the form's "memory" up to date.
    // The dependency array ensures this runs whenever todayEmissions changes.

    // ✅ define categories *inside* the component before using it
    const categories: { name: string; id: TabId; icon: JSX.Element; value: number }[] = [
        { name: 'Transport', id: 'transport', icon: <Footprints size={24} className="mx-auto text-gray-600" />, value: Number(todayEmissions?.transportEmissions ?? 0) },
        { name: 'Energy', id: 'energy', icon: <Zap size={24} className="mx-auto text-gray-600" />, value: Number(todayEmissions?.energyEmissions ?? 0) },
        { name: 'Food', id: 'food', icon: <Apple size={24} className="mx-auto text-gray-600" />, value: Number(todayEmissions?.foodEmissions ?? 0) },
        { name: 'Digital', id: 'digital', icon: <Monitor size={24} className="mx-auto text-gray-600" />, value: Number(todayEmissions?.digitalEmissions ?? 0) },
    ];

    const handleChange = (tab: TabId, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [tab]: { ...prev[tab], [field]: value }
        }));
    };

    const handleAdd = (tab: TabId) => {
        setAdded(prev => ({ ...prev, [tab]: true }));
        setMessage(`${tab.charAt(0).toUpperCase() + tab.slice(1)} added ✅`);
    };

    const handleSubmitAll = async () => {
        setSaving(true);
        setMessage("");
        try {
            const res = await fetch("/api/emissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to save data.");
            }
            setMessage("All data submitted successfully 🎉");
            router.refresh();
        } catch (err) {
            console.error(err);
            const errorMessage = typeof err === "object" && err !== null && "message" in err
                ? (err as { message: string }).message
                : String(err);
            setMessage(`Error: ${errorMessage} ❌`);
        } finally {
            setSaving(false);
        }
    };


    const renderForm = () => {
        switch (activeTab) {
            case "transport":
                return (
                    <div className='text-black'>
                        <label className="block mb-2">Car Distance (kms)</label>
                        <input
                            type="number"
                            value={formData.transport.carDistanceKms}
                            onChange={(e) => handleChange("transport", "carDistanceKms", Number(e.target.value))}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <label className="block mb-2">Car Type</label>
                        <select
                            value={formData.transport.carType}
                            onChange={(e) => handleChange("transport", "carType", e.target.value)}
                            className="w-full p-2 border rounded mb-4"
                        >
                            <option value="">Select</option>
                            <option value="PETROL">Petrol</option>
                            <option value="DIESEL">Diesel</option>
                            <option value="HYBRID">Hybrid</option>
                            <option value="ELECTRIC">Electric</option>
                        </select>
                        <label className="block mb-2">Public Transport (kms)</label>
                        <input
                            type="number"
                            value={formData.transport.publicTransportKms}
                            onChange={(e) => handleChange("transport", "publicTransportKms", Number(e.target.value))}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <label className="block mb-2">Flight (kms)</label>
                        <input
                            type="number"
                            value={formData.transport.flightKms}
                            onChange={(e) => handleChange("transport", "flightKms", Number(e.target.value))}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <label className="block mb-2">Cycling / Walking (kms)</label>
                        <input
                            type="number"
                            value={formData.transport.cyclingWalkingKms || 0}
                            onChange={(e) => handleChange("transport", "cyclingWalkingKms", Number(e.target.value))}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <button
                            type='button'
                            onClick={() => handleAdd("transport")}
                            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                        >Add Transport
                        </button>
                        {added.transport && <span className='mt-2 text-green-600 text-sm'>Transport data added ✅</span>}
                    </div>
                );
            case "energy":
                return (
                    <div className='text-black'>
                        <label className="block mb-2">Office Hours</label>
                        <input
                            type="number"
                            value={formData.energy.officeHours}
                            onChange={(e) => handleChange("energy", "officeHours", Number(e.target.value))}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <label className="block mb-2">Electricity Bill</label>
                        <input
                            type="number"
                            value={formData.energy.electricityBill}
                            onChange={(e) => handleChange("energy", "electricityBill", Number(e.target.value))}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <label className="block mb-2">Emission Factor</label>
                        <input
                            type="number"
                            value={formData.energy.emissionFactor}
                            onChange={(e) => handleChange("energy", "emissionFactor", Number(e.target.value))}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <button
                            type='button'
                            onClick={() => handleAdd("energy")}
                            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                        >Add Energy
                        </button>
                        {added.energy && <span className='mt-2 text-green-600 text-sm'>Energy data added ✅</span>}
                    </div>
                );

            case "food":
                return (
                    <div className='text-black'>
                        <label className="block mb-2">Diet</label>
                        <select
                            value={formData.food.diet}
                            onChange={(e) => handleChange("food", "diet", e.target.value)}
                            className="w-full p-2 border rounded mb-4"
                        >
                            <option value="">Select</option>
                            <option value="VEGAN">Vegan</option>
                            <option value="VEGETARIAN">Vegetarian</option>
                            <option value="MIXED">Mixed</option>
                            <option value="HEAVY_MEAT">Heavy Meat</option>
                        </select>
                        <label className="block mb-2">Food Consumed (kg)</label>
                        <input
                            type='number'
                            value={formData.food.foodConsumed}
                            onChange={(e) => handleChange("food", "foodConsumed", Number(e.target.value))}
                            className='w-full p-2 border rounded mb-4'
                        />
                        <label className="block mb-2">Water Bottles Consumed</label>
                        <input
                            type="number"
                            value={formData.food.waterBottlesConsumed}
                            onChange={(e) => handleChange("food", "waterBottlesConsumed", Number(e.target.value))}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.food.ateLocalOrSeasonalFood}
                                onChange={(e) => handleChange("food", "ateLocalOrSeasonalFood", e.target.checked)}
                            />
                            <span>Ate local/seasonal food</span>
                        </label>
                        <button
                            type='button'
                            onClick={() => handleAdd("food")}
                            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4'
                        >Add Food
                        </button>
                        {added.food && <span className='mt-2 text-green-600 text-sm'>Food data added ✅</span>}
                    </div>
                );
            case "digital":
                return (
                    <div className='text-black'>
                        <label className="block mb-2">Pages Printed</label>
                        <input
                            type="number"
                            value={formData.digital.pagesPrinted}
                            onChange={(e) => handleChange("digital", "pagesPrinted", Number(e.target.value))}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <label className="block mb-2">Video Call Hours</label>
                        <input
                            type="number"
                            value={formData.digital.videoCallHours}
                            onChange={(e) => handleChange("digital", "videoCallHours", Number(e.target.value))}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <label className="block mb-2">Cloud Storage (GB)</label>
                        <input
                            type="number"
                            value={formData.digital.cloudStorageGb}
                            onChange={(e) => handleChange("digital", "cloudStorageGb", Number(e.target.value))}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <button
                            type='button'
                            onClick={() => handleAdd("digital")}
                            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                        >Add Digital
                        </button>
                        {added.digital && <span className='mt-2 text-green-600 text-sm'>Digital data added ✅</span>}
                    </div>

                );
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Daily Carbon Footprint Calculator</h2>
                    <p className="text-gray-600">Fill in your activities category by category</p>
                </div>
                <div className="text-right mt-4 md:mt-0">
                    <p className="text-3xl font-bold text-green-600">{Number(todayEmissions?.totalEmissions ?? 0).toFixed(2)} kg</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {categories.map(cat => (
                    <div
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`p-4 rounded-xl text-center cursor-pointer border-2 transition-all ${activeTab === cat.id ? 'bg-green-100 border-green-500 scale-105' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                    >
                        {cat.icon}
                        <p className="font-semibold text-black mt-2">{cat.name}</p>
                        <p className="font-bold text-black text-lg">{cat.value.toFixed(2)} kg</p>
                    </div>
                ))}
            </div>

            {/* Form */}
            <div className='p-6 border rounded-lg bg-gray-50'>
                {renderForm()}
            </div>
            <button
                onClick={handleSubmitAll}
                disabled={saving}
                className='mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700'
            >
                {saving ? 'Saving...' : 'Submit All'}
            </button>
            {message && <p className='mt-2 text-sm px-6 py-3'>{message}</p>}
        </div>
    );
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
        { name: 'Transport', value: Number(todayEmissions?.transportEmissions ?? 0)/ Number(todayEmissions?.totalEmissions ?? 0) * 100 || 0 },
        { name: 'Energy', value: Number(todayEmissions?.energyEmissions ?? 0)/ Number(todayEmissions?.totalEmissions ?? 0) * 100 || 0 },
        { name: 'Food', value: Number(todayEmissions?.foodEmissions ?? 0)/ Number(todayEmissions?.totalEmissions ?? 0) * 100 || 0 },
        { name: 'Digital', value: Number(todayEmissions?.digitalEmissions ?? 0)/ Number(todayEmissions?.totalEmissions ?? 0) * 100 || 0 },
    ];

    const goalData = [
        { name: 'This Month', value: (thisMonthTotal).toFixed(2) },
        { name: 'Last Month', value: (lastMonthTotal).toFixed(2) },
    ];

    useEffect(() => {
        console.log('All Entries:', allEntries);
        console.log('Today Emissions:', todayEmissions);
        console.log('This Month Total:', thisMonthTotal);
        console.log('Last Month Total:', lastMonthTotal);
    }, [allEntries, todayEmissions, thisMonthTotal, lastMonthTotal]);

    const renderChart = () => {
        switch (activeChart) {
            case 'weekly':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={([...weeklyData].reverse()).map(entry => ({ ...entry, emission: entry.emission.toFixed(2) }))}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="emission" stroke="#4CAF50" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'daily':
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-4xl font-bold text-green-600">
                            {(todayEmissions?.totalEmissions ?? 0).toFixed(2)} kg
                        </p>
                        <p className="text-gray-500 mt-2">Total emissions today</p>
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
                                outerRadius={100}
                                label={({ name, value }) =>
                                    `${name}: ${value.toFixed(2)}%`
                                }
                            >
                                {breakdownData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `${value.toFixed(2)}%`}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );
            case 'goal':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={goalData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#16a34a" />
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
            <div className="mt-4 p-6 bg-gray-50 rounded-lg min-h-[300px]">
                {renderChart()}
            </div>
        </div>
    );
};

const ChatBot = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md animate-fade-in">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Carbon Buddy Chat</h2>
                <p className="text-gray-600">Ask me anything about reducing your carbon footprint!</p>
            </div>
        </div>
    )
}

export default function DashboardPage() {
    const [view, setView] = useState('calculator'); // 'calculator' or 'charts'
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const router = useRouter();

    async function handleLogout() {
        const response = await fetch('/api/logout', {
            method: 'POST',
        });
        router.push('/');

    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/dashboardSummary');
                if (!response.ok) {
                    if (response.status === 401) {
                        // You could redirect to login here: window.location.href = '/login';
                        throw new Error('Unauthorized. Please log in again.');
                    }
                    throw new Error('Failed to fetch dashboard data');
                }
                const summaryData = await response.json();
                setData(summaryData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-700 font-semibold">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen bg-red-50 text-red-700 font-semibold text-center p-4">Error: {error}</div>;
    }

    if (!data) {
        return <div className="flex justify-center items-center h-screen bg-gray-50">No data available. Please add an emission entry.</div>;
    }

    type Summary = {
        thisWeekEmissions: number;
        monthlyReduction: number;
        treesSaved: number;
        streak: number;
    };

    const { userName, summary, todayEmissions, allEntries, thisMonthTotal, lastMonthTotal } = data as {
        userName: string;
        summary: Summary;
        todayEmissions?: TodayEmissions;
        allEntries?: { date: string; totalEmissions: number }[];
        thisMonthTotal?: number;
        lastMonthTotal?: number;
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 md:p-8">
            <button
                onClick={handleLogout}
                className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 float-right"
            >
                Logout
            </button>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome back, {userName}! 🌱</h1>
                    <p className="text-gray-600 text-lg">You're doing great! Here's your carbon footprint summary.</p>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <SummaryCard
                        icon={<BarIcon className="text-green-600" />}
                        title="This Week"
                        value={summary.thisWeekEmissions.toFixed(2)}
                        unit="kg"
                        description="90.0 kg goal"
                        bgColor="bg-green-100"
                    />
                    <SummaryCard
                        icon={<TrendingUp className="text-blue-600" />}
                        title="Monthly Reduction"
                        value={Math.abs(summary.monthlyReduction)}
                        unit="%"
                        description="vs last month"
                        bgColor="bg-blue-100"
                        trend={summary.monthlyReduction >= 0 ? 'up' : 'down'}
                    />
                    <SummaryCard
                        icon={<Leaf className="text-teal-600" />}
                        title="Trees Saved"
                        value={summary.treesSaved}
                        unit="trees"
                        description="based on CO2 reduction"
                        bgColor="bg-teal-100"
                    />
                    <SummaryCard
                        icon={<Droplet className="text-indigo-600" />}
                        title="Streak"
                        value={summary.streak}
                        unit="days"
                        description="days active"
                        bgColor="bg-indigo-100"
                    />
                </div>

                {/* View Toggler */}
                <div className="flex flex-wrap justify-center gap-3 mb-6 bg-white p-2 rounded-xl shadow-sm w-full max-w-md mx-auto">
                    <button
                        onClick={() => setView('calculator')}
                        className={`flex-1 min-w-[100px] px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-center ${view === 'calculator' ? 'bg-green-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Calculator
                    </button>
                    <button
                        onClick={() => setView('charts')}
                        className={`flex-1 min-w-[100px] px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-center ${view === 'charts' ? 'bg-green-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Charts
                    </button>
                    <button
                        onClick={() => setView('chatbot')}
                        className={`flex-1 min-w-[100px] px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-center ${view === 'chatbot' ? 'bg-green-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Chat
                    </button>
                </div>


                {/* Dynamic Content */}
                <main>
                    {{
                        calculator: <CalculatorView todayEmissions={todayEmissions} />,
                        charts: (
                            <ChartsView
                                allEntries={allEntries}
                                todayEmissions={todayEmissions}
                                thisMonthTotal={thisMonthTotal}
                                lastMonthTotal={lastMonthTotal}
                            />
                        ),
                        chatbot: <ChatBot />
                    }[view]}
                </main>

            </div>
            <style jsx global>{`
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

