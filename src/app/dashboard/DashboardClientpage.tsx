"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BarChart as BarIcon, Droplet, Leaf, TrendingUp } from 'lucide-react';
import CalculatorView from './CalculatorView';
import ChartsView from './ChartsView';
import ChatView from './ChatView';

type TodayEmissions = {
    transportEmissions?: number;
    energyEmissions?: number;
    foodEmissions?: number;
    digitalEmissions?: number;
    totalEmissions?: number;
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
};

type Summary = {
    thisWeekEmissions: number;
    monthlyReduction: number;
    treesSaved: number;
    streak: number;
};

const SummaryCard = ({
    icon,
    title,
    value,
    unit,
    description,
    bgColor,
    trend = 'none'
}: {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    unit: string;
    description: string;
    bgColor: string;
    trend?: 'up' | 'down' | 'none';
}) => {
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
                    {isPositive && <TrendingUp size={20} className="ml-2 text-green-600" />}
                    {isNegative && <TrendingUp size={20} className="ml-2 text-red-600" />}
                </div>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
        </div>
    );
};



export default function DashboardPage() {
    const [view, setView] = useState('calculator');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    async function handleLogout() {
        await fetch('/api/logout', { method: 'POST' });
        router.push('/');
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/dashboardSummary');
                if (!response.ok) {
                    if (response.status === 401) throw new Error('Unauthorized. Please log in again.');
                    throw new Error('Failed to fetch dashboard data');
                }
                const summaryData = await response.json();
                setData(summaryData);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const updateHandler = () => fetchData();
        window.addEventListener("dashboardDataUpdated", updateHandler);

        return () => {
            window.removeEventListener("dashboardDataUpdated", updateHandler);
        };
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-700 font-semibold">Loading Dashboard...</div>;
    if (error) return <div className="flex justify-center items-center h-screen bg-red-50 text-red-700 font-semibold text-center p-4">Error: {error}</div>;
    if (!data) return <div className="flex justify-center items-center h-screen bg-gray-50">No data available. Please add an emission entry.</div>;

    const { userName, summary, todayEmissions, allEntries, thisMonthTotal, lastMonthTotal } = data as {
        userName: string;
        summary: Summary;
        todayEmissions?: TodayEmissions;
        allEntries?: { date: string; totalEmissions: number }[];
        thisMonthTotal?: number;
        lastMonthTotal?: number;
    };

    //testing
    // console.log("Data for Chatbot:", todayEmissions);

    let displayPlant = (() => {
        const plants = [
            "🌵", "🌱", "🍃", "🌺", "🌼", "🌸", "🌻", "🌷", "🌾", "🍁",
            "🥀", "🍀", "☘️", "🌴", "🌲", "🎄", "🌳", "🌷", "🌿", "🌾",
            "🌻", "💐", "🏵️", "🌸", "🌼", "🌺", "🍁", "🍃", "🌱", "🌳"
        ];
        const index = Math.min(summary.streak, plants.length - 1);
        return plants[index];
    });

    return (
        <div className="bg-gray-50 min-h-screen p-4 md:p-8">
            <button
                onClick={handleLogout}
                className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 float-right"
            >
                Logout
            </button>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome back, {userName}! {displayPlant()}</h1>
                    <p className="text-gray-600 text-lg">You're doing great! Here's your carbon footprint summary.</p>
                </header>
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
                <div className="flex flex-wrap justify-center gap-3 mb-6 bg-white p-2 rounded-xl shadow-sm w-full max-w-md mx-auto">
                    <button
                        onClick={() => setView('calculator')}
                        className={`flex-1 min-w-[100px] px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-center ${view === 'calculator' ? 'bg-green-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Calculator
                    </button>
                    <button
                        onClick={() => setView('charts')}
                        className={`flex-1 min-w-[100px] px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-center ${view === 'charts' ? 'bg-green-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Charts
                    </button>
                    <button
                        onClick={() => setView('chatbot')}
                        className={`flex-1 min-w-[100px] px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-center ${view === 'chatbot' ? 'bg-green-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Chat
                    </button>
                </div>
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
                        chatbot: <ChatView todayEmissions={todayEmissions} />
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