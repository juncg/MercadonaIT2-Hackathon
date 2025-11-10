'use client'
import React, { useState } from 'react'
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
            <h1 className="text-2xl font-semibold mb-4">Calendario</h1>
 
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
                                                        <div className="relative w-full aspect-square mt-2 overflow-hidden rounded-md shadow-sm">
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
                    <div className="text-center font-medium mb-3">Bloques disponibles</div>
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
                                <div className="relative w-full aspect-square mt-2 overflow-hidden rounded-md shadow-sm">
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