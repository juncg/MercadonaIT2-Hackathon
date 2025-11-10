"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MenuSuggestion, useMenuSuggestions } from "@/lib/use-menu-suggestions";
import Image from "next/image";
import React, { useState } from "react";

type Block = {
    id: string;
    label: string;
    meals: string[];
    color?: string;
    imageUrl?: string;
    price?: string;
    productId?: string;
};

const MEALS: string[] = ["Desayuno", "Comida", "Cena"];
const DAYS: string[] = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
];

const SafeImage = ({
    src,
    alt,
    fill,
    className,
}: {
    src?: string;
    alt: string;
    fill?: boolean;
    className?: string;
}) => {
    const [imgSrc, setImgSrc] = useState(src || "/images/placeholder.png");
    const [hasError, setHasError] = useState(false);

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return url.startsWith("/");
        }
    };

    React.useEffect(() => {
        if (src && isValidUrl(src)) {
            setImgSrc(src);
            setHasError(false);
        } else {
            setImgSrc("/images/placeholder.png");
            setHasError(true);
        }
    }, [src]);

    if (hasError || !isValidUrl(imgSrc)) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-200 ${className}`}
            >
                <span className="text-gray-400 text-xs">Sin imagen</span>
            </div>
        );
    }

    return (
        <Image
            src={imgSrc}
            alt={alt}
            fill={fill}
            className={className}
            onError={() => {
                setImgSrc("/images/placeholder.png");
                setHasError(true);
            }}
        />
    );
};

export default function CalendarioPage() {
    const [blocks, setBlocks] = useState<Block[]>([
        {
            id: "d1",
            label: "Avena y Fruta",
            meals: ["Desayuno"],
            color: "bg-yellow-200",
            imageUrl: "/desayuno-avena.jpg",
        },
        {
            id: "d2",
            label: "Tostada Integral",
            meals: ["Desayuno"],
            color: "bg-green-200",
            imageUrl: "/desayuno-tostada.jpg",
        },
        {
            id: "d3",
            label: "Yogur con Muesli",
            meals: ["Desayuno"],
            color: "bg-slate-200",
            imageUrl: "/desayuno-yogur.jpg",
        },

        {
            id: "c1",
            label: "Ensalada Mediterránea",
            meals: ["Comida"],
            color: "bg-yellow-200",
            imageUrl: "/comida-ensalada.jpg",
        },
        {
            id: "c2",
            label: "Pasta con Verduras",
            meals: ["Comida", "Cena"],
            color: "bg-green-200",
            imageUrl: "/comida-pasta.jpg",
        },
        {
            id: "c3",
            label: "Arroz Integral",
            meals: ["Comida"],
            color: "bg-yellow-200",
            imageUrl: "/comida-arroz.jpg",
        },

        {
            id: "n1",
            label: "Sopa Ligera",
            meals: ["Cena"],
            color: "bg-green-200",
            imageUrl: "/cena-sopa.jpg",
        },
        {
            id: "n2",
            label: "Pescado al Horno",
            meals: ["Cena", "Comida"],
            color: "bg-yellow-200",
            imageUrl: "/cena-pescado.jpg",
        },
        {
            id: "n3",
            label: "Verduras Salteadas",
            meals: ["Cena"],
            color: "bg-green-200",
            imageUrl: "/cena-verduras.jpg",
        },
    ]);

    const [selectedMealIdx, setSelectedMealIdx] = useState<number>(0);
    const [showIAPanel, setShowIAPanel] = useState(false);
    const [preferences, setPreferences] = useState("");
    const [dietaryRestrictions, setDietaryRestrictions] = useState("");
    const [budget, setBudget] = useState("");
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    const { loading, error, suggestions, getSuggestions } =
        useMenuSuggestions();

    const poolBlocks = blocks.filter((b) =>
        b.meals.includes(MEALS[selectedMealIdx])
    );

    const [assignments, setAssignments] = useState<Record<string, Block[]>>(
        () => {
            const map: Record<string, Block[]> = {};
            for (let r = 0; r < MEALS.length; r++) {
                for (let c = 0; c < DAYS.length; c++) {
                    map[`${r}-${c}`] = [];
                }
            }
            return map;
        }
    );

    const handleRequestSuggestions = async () => {
        if (!preferences.trim() || selectedDays.length === 0) {
            alert(
                "Por favor, completa tus preferencias y selecciona al menos un día"
            );
            return;
        }

        try {
            console.log("[Calendar] Requesting suggestions with:", {
                preferences: preferences.substring(0, 50),
                days: selectedDays,
            });

            const suggestions = await getSuggestions({
                preferences,
                dietaryRestrictions: dietaryRestrictions || undefined,
                budget: budget ? parseFloat(budget) : undefined,
                days: selectedDays,
                model: "gemma3:1b",
            });

            console.log("[Calendar] Received suggestions:", suggestions.length);

            const newBlocks: Block[] = suggestions.map(
                (s: MenuSuggestion, idx: number) => ({
                    id: `ai-${s.productId}-${idx}`,
                    label: s.productName,
                    meals: [s.mealType],
                    color: "bg-blue-200",
                    imageUrl: s.thumbnail,
                    price: s.price,
                    productId: s.productId,
                })
            );

            setBlocks((prev) => [...prev, ...newBlocks]);

            suggestions.forEach((s: MenuSuggestion) => {
                const dayIndex = DAYS.indexOf(s.day);
                const mealIndex = MEALS.indexOf(s.mealType);

                if (dayIndex !== -1 && mealIndex !== -1) {
                    const key = `${mealIndex}-${dayIndex}`;
                    const newBlock = newBlocks.find(
                        (b) =>
                            b.productId === s.productId &&
                            b.label === s.productName
                    );

                    if (newBlock) {
                        setAssignments((prev) => ({
                            ...prev,
                            [key]: [...(prev[key] || []), newBlock],
                        }));
                    }
                }
            });

            setShowIAPanel(false);
        } catch (err) {
            console.error("[Calendar] Error al obtener sugerencias:", err);
            const errorMessage =
                err instanceof Error ? err.message : "Error desconocido";
            alert(`Error: ${errorMessage}`);
        }
    };

    const toggleDaySelection = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const onDragStart = (
        e: React.DragEvent,
        payload: {
            id: string;
            source: "pool" | "cell";
            key?: string;
            index?: number;
        }
    ) => {
        e.dataTransfer.setData("application/json", JSON.stringify(payload));
        e.dataTransfer.effectAllowed = "move";
    };

    const allowDrop = (e: React.DragEvent) => e.preventDefault();

    const onDropToCell = (e: React.DragEvent, row: number, col: number) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData("application/json");
        if (!raw) return;
        const payload = JSON.parse(raw) as {
            id: string;
            source: "pool" | "cell";
            key?: string;
            index?: number;
        };
        const block = blocks.find((b) => b.id === payload.id);
        if (!block) return;
        const destKey = `${row}-${col}`;

        const srcKey = payload.key;
        const srcIndex = payload.index;

        setAssignments((prev) => {
            const next = { ...prev };
            next[destKey] = [...(next[destKey] ?? []), block];

            if (
                payload.source === "cell" &&
                srcKey &&
                typeof srcIndex === "number"
            ) {
                const srcArr = [...(next[srcKey] ?? [])];
                if (srcArr[srcIndex] && srcArr[srcIndex].id === payload.id) {
                    srcArr.splice(srcIndex, 1);
                } else {
                    const idx = srcArr.findIndex((b) => b.id === payload.id);
                    if (idx >= 0) srcArr.splice(idx, 1);
                }
                next[srcKey] = srcArr;
            }
            return next;
        });
    };

    const onDropToPool = (e: React.DragEvent) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData("application/json");
        if (!raw) return;
        const payload = JSON.parse(raw) as {
            id: string;
            source: "pool" | "cell";
            key?: string;
            index?: number;
        };

        const srcKey = payload.key;
        const srcIndex = payload.index;

        if (
            payload.source === "cell" &&
            srcKey &&
            typeof srcIndex === "number"
        ) {
            setAssignments((prev) => {
                const next = { ...prev };
                const srcArr = [...(next[srcKey] ?? [])];
                if (srcArr[srcIndex] && srcArr[srcIndex].id === payload.id) {
                    srcArr.splice(srcIndex, 1);
                } else {
                    const idx = srcArr.findIndex((b) => b.id === payload.id);
                    if (idx >= 0) srcArr.splice(idx, 1);
                }
                next[srcKey] = srcArr;
                return next;
            });
        }
    };

    return (
        <main className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Calendario</h1>
                <Button
                    onClick={() => setShowIAPanel(!showIAPanel)}
                    variant={showIAPanel ? "secondary" : "default"}
                >
                    {showIAPanel ? "Cerrar IA" : "🤖 Sugerencias con IA"}
                </Button>
            </div>

            {showIAPanel && (
                <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
                    <h2 className="text-lg font-semibold mb-3">
                        Generador de Menú con IA
                    </h2>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Preferencias alimentarias
                            </label>
                            <Textarea
                                placeholder="Ejemplo: Me gusta la comida mediterránea, prefiero platos ligeros..."
                                value={preferences}
                                onChange={(e) => setPreferences(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Restricciones dietéticas (opcional)
                            </label>
                            <Input
                                placeholder="Ejemplo: Sin gluten, vegetariano..."
                                value={dietaryRestrictions}
                                onChange={(e) =>
                                    setDietaryRestrictions(e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Presupuesto aproximado (opcional)
                            </label>
                            <Input
                                type="number"
                                placeholder="50"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Selecciona los días
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS.map((day) => (
                                    <button
                                        key={day}
                                        onClick={() => toggleDaySelection(day)}
                                        className={`px-3 py-1 rounded text-sm transition-colors ${
                                            selectedDays.includes(day)
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleRequestSuggestions}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading
                                ? "⏳ Generando sugerencias (puede tardar 1-2 minutos)..."
                                : "Generar menú"}
                        </Button>

                        {loading && (
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded text-sm">
                                ⏳ Procesando con IA... Esto puede tardar 1-2
                                minutos dependiendo de tu ordenador. Por favor
                                espera.
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
                                Error: {error}
                            </div>
                        )}

                        {suggestions.length > 0 && (
                            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded text-sm">
                                ✓ {suggestions.length} productos añadidos al
                                calendario
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex gap-6 items-start">
                <div className="overflow-auto border rounded flex-1">
                    <div className="min-w-[820px]">
                        <div className="grid grid-cols-8">
                            <div className="p-3 border-b border-r bg-gray-50"></div>
                            {DAYS.map((day) => (
                                <div
                                    key={day}
                                    className="p-3 text-center font-medium border-b border-r bg-gray-50"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {MEALS.map((meal, row) => (
                            <div key={meal} className="grid grid-cols-8">
                                <div className="p-3 border-r border-b flex items-center font-medium bg-white">
                                    {meal}
                                </div>

                                {DAYS.map((_, col) => {
                                    const key = `${row}-${col}`;
                                    const assigned = assignments[key] ?? [];
                                    return (
                                        <div
                                            key={key}
                                            className="p-2 border-r border-b min-h-[10rem] flex flex-col items-start gap-2"
                                            onDragOver={allowDrop}
                                            onDrop={(e) =>
                                                onDropToCell(e, row, col)
                                            }
                                            data-row={row}
                                            data-col={col}
                                        >
                                            {assigned.length > 0 ? (
                                                assigned.map(
                                                    (assignedBlock, idx) => (
                                                        <div
                                                            key={
                                                                assignedBlock.id +
                                                                "-" +
                                                                idx
                                                            }
                                                            draggable
                                                            onDragStart={(e) =>
                                                                onDragStart(e, {
                                                                    id: assignedBlock.id,
                                                                    source: "cell",
                                                                    key,
                                                                    index: idx,
                                                                })
                                                            }
                                                            className={`px-3 py-2 rounded shadow-sm cursor-move w-full ${
                                                                assignedBlock.color ??
                                                                "bg-slate-200"
                                                            }`}
                                                        >
                                                            <div className="text-sm font-medium">
                                                                {
                                                                    assignedBlock.label
                                                                }
                                                            </div>
                                                            {assignedBlock.price && (
                                                                <div className="text-xs font-semibold text-green-700 mt-1">
                                                                    {
                                                                        assignedBlock.price
                                                                    }
                                                                    €
                                                                </div>
                                                            )}
                                                            <div className="relative w-full h-20 mt-2 overflow-hidden rounded-md shadow-sm">
                                                                <SafeImage
                                                                    src={
                                                                        assignedBlock.imageUrl
                                                                    }
                                                                    alt={
                                                                        assignedBlock.label
                                                                    }
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                )
                                            ) : (
                                                <div className="text-sm text-slate-400">
                                                    Arrastra aquí
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        <div className="grid grid-cols-8 bg-white">
                            <div className="p-3 border-t col-span-1"></div>
                            {DAYS.map((_, i) => (
                                <div
                                    key={i}
                                    className="p-2 border-t border-r"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <aside
                    className="w-72 border rounded p-3 bg-white self-start"
                    onDragOver={allowDrop}
                    onDrop={onDropToPool}
                >
                    <div className="text-center font-medium mb-3">
                        Productos Disponibles
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-3">
                        {MEALS.map((m, idx) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setSelectedMealIdx(idx)}
                                aria-pressed={selectedMealIdx === idx}
                                className={`px-3 py-1 rounded text-sm ${
                                    selectedMealIdx === idx
                                        ? "bg-slate-800 text-white"
                                        : "bg-slate-100 text-slate-700"
                                }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2 max-h-[450px] overflow-auto">
                        {poolBlocks.map((b) => (
                            <div
                                key={b.id}
                                draggable
                                onDragStart={(e) =>
                                    onDragStart(e, { id: b.id, source: "pool" })
                                }
                                className={`px-3 py-2 rounded cursor-move text-center ${b.color}`}
                            >
                                <div className="font-medium">{b.label}</div>
                                <div className="text-xs text-slate-600 mt-1">
                                    {b.meals.join(" · ")}
                                </div>
                                {b.price && (
                                    <div className="text-xs font-semibold text-green-700 mt-1">
                                        {b.price}€
                                    </div>
                                )}
                                <div className="relative w-50 h-30 mt-2 mx-auto overflow-hidden rounded-md shadow-sm">
                                    <SafeImage
                                        src={b.imageUrl}
                                        alt={b.label}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </main>
    );
}
