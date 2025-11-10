'use client'
import React, { useState } from 'react'
import Image from 'next/image'

type Block = {
    id: string
    label: string
    color?: string
    imageUrl?: string
}

const MEALS: string[] = ['Desayuno', 'Comida', 'Cena']
const DAYS: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function CalendarioPage(): JSX.Element {
    const initialBlocks: Block[] = [
        { id: 'b1', label: 'Plan Mediterráneo', color: 'bg-yellow-200', imageUrl: '/plan-mediterraneo.jpg' },
        { id: 'b2', label: 'Plan Vegetariano', color: 'bg-green-200', imageUrl: '/plan-vegetariano.jpeg' },
        { id: 'b3', label: 'Plan Casero', color: 'bg-yellow-200', imageUrl: '/plan-casero.jpg' },
        { id: 'b4', label: 'Plan Kids', color: 'bg-green-200', imageUrl: '/plan-kids.jpg' },
        { id: 'b5', label: 'Plan Gourmet', color: 'bg-yellow-200', imageUrl: '/plan-gourmet.jpg' },
        { id: 'b6', label: 'Plan de Temporada', color: 'bg-green-200', imageUrl: '/plan-de-temporada.jpeg' },
    ]

    const [blocks] = useState<Block[]>(initialBlocks)
    const [assignments, setAssignments] = useState<Record<string, Block | null>>(() => {
        const map: Record<string, Block | null> = {}
        for (let r = 0; r < MEALS.length; r++) {
            for (let c = 0; c < DAYS.length; c++) {
                map[`${r}-${c}`] = null
            }
        }
        return map
    })

    const onDragStart = (e: React.DragEvent, payload: { id: string; source: 'pool' | 'cell'; key?: string }) => {
        e.dataTransfer.setData('application/json', JSON.stringify(payload))
        e.dataTransfer.effectAllowed = 'move'
    }

    const allowDrop = (e: React.DragEvent) => e.preventDefault()

    const onDropToCell = (e: React.DragEvent, row: number, col: number) => {
        e.preventDefault()
        const raw = e.dataTransfer.getData('application/json')
        if (!raw) return
        const payload = JSON.parse(raw) as { id: string; source: 'pool' | 'cell'; key?: string }
        const block = blocks.find(b => b.id === payload.id)
        if (!block) return
        setAssignments(prev => {
            const next = { ...prev }
            next[`${row}-${col}`] = block
            if (payload.source === 'cell' && payload.key) next[payload.key] = null
            return next
        })
    }

    const onDropToPool = (e: React.DragEvent) => {
        e.preventDefault()
        const raw = e.dataTransfer.getData('application/json')
        if (!raw) return
        const payload = JSON.parse(raw) as { id: string; source: 'pool' | 'cell'; key?: string }
        if (payload.source === 'cell' && payload.key) {
            setAssignments(prev => {
                const next = { ...prev }
                next[payload.key!] = null
                return next
            })
        }
    }

    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Calendario</h1>

            <div className="flex gap-6">
                {/* calendario */}
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
                                    const assigned = assignments[key]
                                    return (
                                        <div
                                            key={key}
                                            className="p-2 border-r border-b min-h-[10rem] flex items-start justify-center"
                                            onDragOver={allowDrop}
                                            onDrop={e => onDropToCell(e, row, col)}
                                            data-row={row}
                                            data-col={col}
                                        >
                                            {assigned ? (
                                                <div
                                                    draggable
                                                    onDragStart={e => onDragStart(e, { id: assigned.id, source: 'cell', key })}
                                                    className={`px-3 py-2 rounded shadow-sm cursor-move w-full ${assigned.color ?? 'bg-slate-200'}`}
                                                >
                                                    <div className="text-sm font-medium">{assigned.label}</div>
                                                    <div className="relative w-full aspect-square mt-2 overflow-hidden rounded-md shadow-sm">
                                                        <Image
                                                            src={assigned.imageUrl ?? '/images/placeholder.png'}
                                                            alt={assigned.label}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-slate-400">Arrastra aquí</div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}

                        <div className="grid grid-cols-8">
                            <div className="p-3 border-t col-span-1"></div>
                            {DAYS.map((_, i) => (
                                <div key={i} className="p-2 border-t border-r" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* panel derecho: bloques disponibles */}
                <aside
                    className="w-72 border rounded p-3 bg-white"
                    onDragOver={allowDrop}
                    onDrop={onDropToPool}
                >
                    <div className="text-center font-medium mb-3">Planes disponibles</div>
                    <div className="flex flex-col gap-2 max-h-[480px] overflow-auto">
                        {blocks.map(b => (
                            <div
                                key={b.id}
                                draggable
                                onDragStart={e => onDragStart(e, { id: b.id, source: 'pool' })}
                                className={`px-3 py-2 rounded cursor-move text-center ${b.color}`}
                            >
                                <div className="font-medium">{b.label}</div>
                                <div className="relative w-full h-20 mt-2 overflow-hidden rounded-md shadow-sm">
                                    <Image
                                        src={b.imageUrl ?? '/images/placeholder.png'}
                                        alt={b.label}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="mt-2 text-sm text-slate-500 text-center">Arrastra a una celda para asignar</div>
                    </div>
                </aside>
            </div>
        </main>
    )
}