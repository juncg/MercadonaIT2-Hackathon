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
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        hover:shadow-lg
        ${isExpandedView
                    ? 'flex-row justify-start gap-6 text-left h-32'
                    : 'flex-col aspect-square h-48'
                }
        ${isExpanded ? 'border-[var(--mercadona-green)]' : ''}
      `}
        >
            <div className={`
        ${isExpandedView
                    ? 'flex-1 text-left order-2 relative pb-12'
                    : 'text-center order-1'
                }
      `}>

                <div>
                    <h3 className={`
          font-semibold 
          ${isExpandedView
                            ? 'text-xl mb-2 pt-4'
                            : 'text-lg'
                        }
          ${isExpanded ? 'text-[var(--mercadona-green)]' : ''}
        `}>
                        {item.title}
                    </h3>
                </div>
                <div className='max-w-[80ch]'>
                    {isExpandedView && item.expandedContent && (
                        <p className="text-sm text-muted-foreground text-balance">
                            {item.expandedContent}
                        </p>
                    )}
                </div>
                <div>
                    {isExpandedView && (
                        <Link href="/calendario">
                            <button
                                type="button" // PLACEHOLDER
                                className="absolute right-7 bottom-7 inline-flex items-center px-4 py-2 bg-mercadona-green text-white rounded hover:bg-mercadona-green/90 transition-colors pt-2 pb-2"
                            >
                                Botón

                            </button>
                        </Link>
                    )}
                </div>

            </div>

            <div className={` 
        relative overflow-hidden rounded-lg shadow-lg
        ${isExpandedView
                    ? 'w-20 h-20 flex-shrink-0 order-1'
                    : 'w-24 h-24 mb-3 order-2'
                }
        transition-[width,height] duration-300 ease-in-out
      `}>
                <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover rounded transition-none"
                />

            </div>

        </Button >
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