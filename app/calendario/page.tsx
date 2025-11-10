'use client'
import React, { JSX, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

type Block = {
    id: string
    label: string
    meals: string[]
    color?: string
    imageUrl?: string
}

const MEALS: string[] = ['Desayuno', 'Comida', 'Cena']
const DAYS: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

type MealPlan = Record<string, string[]>
type DayPlan = Record<string, MealPlan>
type Plan = Record<string, DayPlan>

function createEmptyPlan(planName: string): Plan {
    const plan: Plan = {}
    plan[planName] = {}
    for (const day of DAYS) {
        plan[planName][day] = {}
        for (const meal of MEALS) {
            plan[planName][day][meal] = []
        }
    }
    return plan
}

function createPlanFromAssignments(planName: string, assignments: Record<string, Block[]>): Plan {
    const plan = createEmptyPlan(planName)
    for (const key of Object.keys(assignments)) {
        const [rowStr, colStr] = key.split('-')
        const row = Number(rowStr)
        if (Number.isNaN(row)) continue
        const meal = MEALS[row]
        const col = Number(colStr)
        const day = DAYS[col]
        if (!meal || !day) continue
        const items = assignments[key].map(b => b.label)
        plan[planName][day][meal] = [...plan[planName][day][meal], ...items]
    }
    return plan
}

function savePlanToLocalStorage(plan: Plan) {
    const existingRaw = localStorage.getItem('meal-plans')
    const existing: Record<string, DayPlan> = existingRaw ? JSON.parse(existingRaw) : {}
    const [name] = Object.keys(plan)
    existing[name] = plan[name]
    localStorage.setItem('meal-plans', JSON.stringify(existing))
}

function loadPlansFromLocalStorage(): Record<string, DayPlan> {
    const raw = localStorage.getItem('meal-plans')
    return raw ? JSON.parse(raw) : {}
}

export default function CalendarioPage(): JSX.Element {
    const BLOCKS: Block[] = [
        { id: 'd1', label: 'Avena y Fruta', meals: ['Desayuno'], color: 'bg-yellow-200', imageUrl: '/desayuno-avena.jpg' },
        { id: 'd2', label: 'Tostada Integral', meals: ['Desayuno'], color: 'bg-green-200', imageUrl: '/desayuno-tostada.jpg' },
        { id: 'd3', label: 'Yogur con Muesli', meals: ['Desayuno'], color: 'bg-slate-200', imageUrl: '/desayuno-yogur.jpg' },
 
        { id: 'c1', label: 'Ensalada Mediterránea', meals: ['Comida'], color: 'bg-yellow-200', imageUrl: '/comida-ensalada.jpg' },
        { id: 'c2', label: 'Pasta con Verduras', meals: ['Comida', 'Cena'], color: 'bg-green-200', imageUrl: '/comida-pasta.jpg' },
        { id: 'c3', label: 'Arroz Integral', meals: ['Comida'], color: 'bg-yellow-200', imageUrl: '/comida-arroz.jpg' },
 
        { id: 'n1', label: 'Sopa Ligera', meals: ['Cena'], color: 'bg-green-200', imageUrl: '/cena-sopa.jpg' },
        { id: 'n2', label: 'Pescado al Horno', meals: ['Cena', 'Comida'], color: 'bg-yellow-200', imageUrl: '/cena-pescado.jpg' },
        { id: 'n3', label: 'Verduras Salteadas', meals: ['Cena'], color: 'bg-green-200', imageUrl: '/cena-verduras.jpg' },
    ]
  
    const [selectedMealIdx, setSelectedMealIdx] = useState<number>(0)
    const poolBlocks = BLOCKS.filter(b => b.meals.includes(MEALS[selectedMealIdx]))
 
    const [assignments, setAssignments] = useState<Record<string, Block[]>>(() => {
        const map: Record<string, Block[]> = {}
        for (let r = 0; r < MEALS.length; r++) {
            for (let c = 0; c < DAYS.length; c++) {
                map[`${r}-${c}`] = []
            }
        }
        return map
    })
 
    const [planName, setPlanName] = useState<string>('plan1')
    const searchParams = useSearchParams()
 
    useEffect(() => {
        const planDataRaw = searchParams.get('planData')
        if (planDataRaw) {
            try {
                const parsed = JSON.parse(planDataRaw)
                const [name] = Object.keys(parsed)
                const dayPlan = parsed[name] as Record<string, Record<string, string[]>>
                const map: Record<string, Block[]> = {}
                for (let r = 0; r < MEALS.length; r++) {
                    for (let c = 0; c < DAYS.length; c++) {
                        map[`${r}-${c}`] = []
                    }
                }

                for (let c = 0; c < DAYS.length; c++) {
                    const day = DAYS[c]
                    const mealsForDay = dayPlan[day] ?? {}
                    for (let r = 0; r < MEALS.length; r++) {
                        const meal = MEALS[r]
                        const products = mealsForDay[meal] ?? []
                        for (const label of products) {
                            const block = BLOCKS.find(b => b.label === label)
                            if (block) {
                                map[`${r}-${c}`].push(block)
                            }
                        }
                    }
                }

                setAssignments(map)
                setPlanName(name)
                return
            } catch {
                // ignore parse errors and fallthrough to existing load logic
            }
        }

        const planToLoad = searchParams.get('plan')
        if (!planToLoad) return
        const raw = localStorage.getItem('meal-plans')
        if (!raw) return
        try {
            const parsed = JSON.parse(raw) as Record<string, Record<string, Record<string, string[]>>>
            const dayPlan = parsed[planToLoad]
            if (!dayPlan) return
            setPlanName(planToLoad)
 
            const map: Record<string, Block[]> = {}
            for (let r = 0; r < MEALS.length; r++) {
                for (let c = 0; c < DAYS.length; c++) {
                    map[`${r}-${c}`] = []
                }
            }
 
            for (let c = 0; c < DAYS.length; c++) {
                const day = DAYS[c]
                const mealsForDay = dayPlan[day] ?? {}
                for (let r = 0; r < MEALS.length; r++) {
                    const meal = MEALS[r]
                    const products = mealsForDay[meal] ?? []
                    for (const label of products) {
                        const block = BLOCKS.find(b => b.label === label)
                        if (block) map[`${r}-${c}`].push(block)
                    }
                }
            }
 
            setAssignments(map)
        } catch {
            // ignore parse errors
        }
    }, [searchParams])
 
    const handleSavePlan = () => {
        const plan = createPlanFromAssignments(planName || 'plan1', assignments)
        savePlanToLocalStorage(plan)
        alert('Plan guardado')
    }
 
    const onDragStart = (e: React.DragEvent, payload: { id: string; source: 'pool' | 'cell'; key?: string; index?: number }) => {
        e.dataTransfer.setData('application/json', JSON.stringify(payload))
        e.dataTransfer.effectAllowed = 'move'
    }

    const allowDrop = (e: React.DragEvent) => e.preventDefault()

    const onDropToCell = (e: React.DragEvent, row: number, col: number) => {
        e.preventDefault()
        const raw = e.dataTransfer.getData('application/json')
        if (!raw) return
        const payload = JSON.parse(raw) as { id: string; source: 'pool' | 'cell'; key?: string; index?: number }
        const block = BLOCKS.find(b => b.id === payload.id)
        if (!block) return
        const destKey = `${row}-${col}`
 
        const srcKey = payload.key
        const srcIndex = payload.index
 
        setAssignments(prev => {
            const next = { ...prev }
            next[destKey] = [...(next[destKey] ?? []), block]
 
            if (payload.source === 'cell' && srcKey && typeof srcIndex === 'number') {
                const srcArr = [...(next[srcKey] ?? [])]
                if (srcArr[srcIndex] && srcArr[srcIndex].id === payload.id) {
                    srcArr.splice(srcIndex, 1)
                } else {
                    const idx = srcArr.findIndex(b => b.id === payload.id)
                    if (idx >= 0) srcArr.splice(idx, 1)
                }
                next[srcKey] = srcArr
            }
            return next
        })
    }

    const onDropToPool = (e: React.DragEvent) => {
        e.preventDefault()
        const raw = e.dataTransfer.getData('application/json')
        if (!raw) return
        const payload = JSON.parse(raw) as { id: string; source: 'pool' | 'cell'; key?: string; index?: number }
 
        const srcKey = payload.key
        const srcIndex = payload.index
 
        if (payload.source === 'cell' && srcKey && typeof srcIndex === 'number') {
            setAssignments(prev => {
                const next = { ...prev }
                const srcArr = [...(next[srcKey] ?? [])]
                if (srcArr[srcIndex] && srcArr[srcIndex].id === payload.id) {
                    srcArr.splice(srcIndex, 1)
                } else {
                    const idx = srcArr.findIndex(b => b.id === payload.id)
                    if (idx >= 0) srcArr.splice(idx, 1)
                }
                next[srcKey] = srcArr
                return next
            })
        }
    }

    return (
        <main className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">Calendario</h1>
                <div className="flex items-center gap-2">
                    <input
                        value={planName}
                        onChange={e => setPlanName(e.target.value)}
                        placeholder="Nombre del plan"
                        className="px-2 py-1 border rounded text-sm"
                        aria-label="Nombre del plan"
                    />
                    <button
                        type="button"
                        onClick={handleSavePlan}
                        className="px-3 py-1 rounded bg-slate-800 text-white text-sm"
                    >
                        Guardar plan
                    </button>
                </div>
            </div>
 
            <div className="flex gap-6 items-start">
                <div className="overflow-auto border rounded flex-1">
                    <div className="min-w-[820px]">
                        <div className="grid grid-cols-8">
                            <div className="p-3 border-b border-r bg-gray-50"></div>
                            {DAYS.map(day => (
                                <div key={day} className="p-3 text-center font-medium border-b border-r bg-gray-50">
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
                                    const key = `${row}-${col}`
                                    const assigned = assignments[key] ?? []
                                    return (
                                        <div
                                            key={key}
                                            className="p-2 border-r border-b min-h-[10rem] flex flex-col items-start gap-2"
                                            onDragOver={allowDrop}
                                            onDrop={e => onDropToCell(e, row, col)}
                                            data-row={row}
                                            data-col={col}
                                        >
                                            {assigned.length > 0 ? (
                                                assigned.map((assignedBlock, idx) => (
                                                    <div
                                                        key={assignedBlock.id + '-' + idx}
                                                        draggable
                                                        onDragStart={e => onDragStart(e, { id: assignedBlock.id, source: 'cell', key, index: idx })}
                                                        className={`px-3 py-2 rounded shadow-sm cursor-move w-full ${assignedBlock.color ?? 'bg-slate-200'}`}
                                                    >
                                                        <div className="text-sm font-medium">{assignedBlock.label}</div>
                                                        <div className="relative w-full h-20 mt-2 overflow-hidden rounded-md shadow-sm">
                                                            <Image
                                                                src={assignedBlock.imageUrl ?? '/images/placeholder.png'}
                                                                alt={assignedBlock.label}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-slate-400">Arrastra aquí</div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
 
                        <div className="grid grid-cols-8 bg-white">
                            <div className="p-3 border-t col-span-1"></div>
                            {DAYS.map((_, i) => (
                                <div key={i} className="p-2 border-t border-r" />
                            ))}
                        </div>
                    </div>
                </div>
 
                <aside
                    className="w-72 border rounded p-3 bg-white self-start"
                    onDragOver={allowDrop}
                    onDrop={onDropToPool}
                >
                    <div className="text-center font-medium mb-3">Productos Disponibles</div>
                    <div className="flex items-center justify-center gap-2 mb-3">
                        {MEALS.map((m, idx) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setSelectedMealIdx(idx)}
                                aria-pressed={selectedMealIdx === idx}
                                className={`px-3 py-1 rounded text-sm ${selectedMealIdx === idx ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2 max-h-[450px] overflow-auto">
                        {poolBlocks.map(b => (
                            <div
                                key={b.id}
                                draggable
                                onDragStart={e => onDragStart(e, { id: b.id, source: 'pool' })}
                                className={`px-3 py-2 rounded cursor-move text-center ${b.color}`}
                            >
                                <div className="font-medium">{b.label}</div>
                                <div className="text-xs text-slate-600 mt-1">{b.meals.join(' · ')}</div>
                                <div className="relative w-50 h-30 mt-2 mx-auto overflow-hidden rounded-md shadow-sm">
                                    <Image
                                        src={b.imageUrl ?? '/images/placeholder.png'}
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
    )
}