"use client";

import { useState, useEffect } from 'react';
import { Footprints, Zap, Apple, Monitor } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

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

    const [formData, setFormData] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("carbonFormData");
            if (saved) return JSON.parse(saved);
        }
        return {
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
        };
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("carbonFormData", JSON.stringify(formData));
        }
    }, [formData]);

    const [activeTab, setActiveTab] = useState<TabId>('transport');
    const [added, setAdded] = useState<{ [K in TabId]?: boolean }>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("carbonAddedTabs");
            if (saved) return JSON.parse(saved);
        }
        return {
            transport: false,
            energy: false,
            food: false,
            digital: false,
        };
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("carbonAddedTabs", JSON.stringify(added));
        }
    }, [added]);

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    const categories: { name: string; id: TabId; icon: React.ReactElement; value: number }[] = [
        { name: 'Transport', id: 'transport', icon: <Footprints size={24} className="mx-auto text-gray-600" />, value: Number(todayEmissions?.transportEmissions ?? 0) },
        { name: 'Energy', id: 'energy', icon: <Zap size={24} className="mx-auto text-gray-600" />, value: Number(todayEmissions?.energyEmissions ?? 0) },
        { name: 'Food', id: 'food', icon: <Apple size={24} className="mx-auto text-gray-600" />, value: Number(todayEmissions?.foodEmissions ?? 0) },
        { name: 'Digital', id: 'digital', icon: <Monitor size={24} className="mx-auto text-gray-600" />, value: Number(todayEmissions?.digitalEmissions ?? 0) },
    ];

    const handleChange = (tab: TabId, field: string, value: any) => {
        setFormData((prev: typeof formData) => ({
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
            if (typeof window !== "undefined") {
                localStorage.removeItem("carbonFormData");
                localStorage.removeItem("carbonAddedTabs");
            }
            setAdded({
                transport: false,
                energy: false,
                food: false,
                digital: false,
            });
            if (typeof window !== "undefined" && window.dispatchEvent) {
                window.dispatchEvent(new Event("dashboardDataUpdated"));
            }
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

export default CalculatorView;