'use client'
import React, { JSX, useEffect, useState } from 'react'
import { ExpandableGrid } from '@/components/expandable-grid'

type MealMap = Record<string, string[]>
type DayPlan = Record<string, MealMap>
type StoredPlans = Record<string, DayPlan>

function formatPlan(dayPlan: DayPlan): string {
    const days = Object.keys(dayPlan)
    if (days.length === 0) return 'Vacío'
    return days
        .map(day => {
            const meals = Object.keys(dayPlan[day] ?? {})
            const mealsText = meals
                .map(meal => {
                    const products = dayPlan[day][meal] ?? []
                    if (products.length === 0) return `    ${meal}:`
                    return `    ${meal}:\n${products.map(p => `      - ${p}`).join('\n')}`
                })
                .join('\n')
            return `${day}:\n${mealsText}`
        })
        .join('\n\n')
}

export default function UserPlansGrid(): JSX.Element | null {
    const [items, setItems] = useState<
        { id: string; title: string; imageUrl: string; expandedContent: string }[]
    >([])

    useEffect(() => {
        const raw = localStorage.getItem('meal-plans')
        if (!raw) {
            setItems([])
            return
        }
        try {
            const parsed = JSON.parse(raw) as StoredPlans
            const mapped = Object.entries(parsed).map(([name, plan]) => ({
                id: name,
                title: name,
                imageUrl: '/cesta-placeholder.jpg',
                expandedContent: formatPlan(plan),
                actionHref: `/calendario?plan=${encodeURIComponent(name)}`,
            }))
            setItems(mapped)
        } catch {
            setItems([])
        }
    }, [])

    if (items.length === 0) return null

    return (
        <div className="max-w-6xl mx-auto py-4 px-6 mt-10">
            <h2 className="text-2xl font-semibold mb-4">Tus planes creados</h2>
            <p className="text-muted-foreground mb-6">Aquí están los planes que has guardado.</p>
            <ExpandableGrid items={items} />
        </div>
    )
}