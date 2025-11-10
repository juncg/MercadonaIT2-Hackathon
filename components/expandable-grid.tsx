'use client'

import { JSX, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface GridItem {
    id: string
    title: string
    imageUrl: string
    expandedContent?: string
    actionHref?: string
}

interface ExpandableGridProps {
    items: GridItem[]
    columns?: number
}

interface ExpandableButtonProps {
    item: GridItem
    isExpanded: boolean
    onToggle: () => void
    isExpandedView?: boolean
}

function ExpandableButton({ item, isExpanded, onToggle, isExpandedView = false }: ExpandableButtonProps) {
    return (
        <Button
            onClick={onToggle}
            variant="outline"
            className={`
        w-full h-full p-4 
        transition-all duration-300 ease-in-out
        hover:shadow-lg
        ${isExpanded ? 'border-[var(--mercadona-green)]' : ''}
        ${isExpandedView ? 'p-6' : 'p-4'}
      `}
        >
            {isExpandedView ? (
                <div className="w-full grid grid-cols-[96px_1fr_160px] gap-6 items-center">
                    <div className="w-24 h-24 relative rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                        <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="text-left">
                        <h3 className={`font-semibold text-xl ${isExpanded ? 'text-[var(--mercadona-green)]' : ''}`}>
                            {item.title}
                        </h3>
                        {item.expandedContent && (
                            <p className="text-sm text-muted-foreground mt-2 text-balance">
                                {item.expandedContent}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end">
                        <Link
                            href={item.actionHref ?? '/calendario'}
                            className="inline-flex items-center h-10 px-4 bg-mercadona-green text-white rounded hover:bg-mercadona-green/90 transition-colors"
                        >
                            Mostrar Plan
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-2">
                    <h3 className={`font-semibold text-lg ${isExpanded ? 'text-[var(--mercadona-green)]' : ''}`}>
                        {item.title}
                    </h3>
                    <div className="w-24 h-24 relative overflow-hidden rounded-lg shadow-lg">
                        <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            )}
        </Button>
    )
}

export function ExpandableGrid({ items, columns = 3 }: ExpandableGridProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const handleToggle = (id: string) => {
        setExpandedId(expandedId === id ? null : id)
    }

    const getRowItems = (itemIndex: number) => {
        const rowIndex = Math.floor(itemIndex / columns)
        const rowStart = rowIndex * columns
        const rowEnd = Math.min(rowStart + columns, items.length)
        return items.slice(rowStart, rowEnd)
    }

    const renderGrid = () => {
        const result: JSX.Element[] = []
        const processedRows = new Set<number>()

        items.forEach((item, index) => {
            const rowIndex = Math.floor(index / columns)

            if (processedRows.has(rowIndex)) return

            const rowItems = getRowItems(index)
            const expandedInRow = rowItems.find(rowItem => rowItem.id === expandedId)

            if (expandedInRow) {
                result.push(
                    <div key={`expanded-${rowIndex}`} className="md:col-span-3">
                        <ExpandableButton
                            item={expandedInRow}
                            isExpanded={true}
                            onToggle={() => handleToggle(expandedInRow.id)}
                            isExpandedView={true}
                        />
                    </div>
                )
            }

            rowItems.forEach((rowItem) => {
                result.push(
                    <div key={rowItem.id} className="md:col-span-1">
                        <ExpandableButton
                            item={rowItem}
                            isExpanded={rowItem.id === expandedId}
                            onToggle={() => handleToggle(rowItem.id)}
                            isExpandedView={false}
                        />
                    </div>
                )
            })

            processedRows.add(rowIndex)
        })

        return result
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-max">
            {renderGrid()}
        </div>
    )
}