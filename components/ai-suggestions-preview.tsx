import Image from "next/image";

interface MenuSuggestion {
    productId: string;
    productName: string;
    price: string;
    thumbnail: string;
    mealType: "Desayuno" | "Comida" | "Cena";
    day: string;
    reason: string;
}

interface AISuggestionsPreviewProps {
    suggestions: MenuSuggestion[];
    onApply: () => void;
    onCancel: () => void;
}

export function AISuggestionsPreview({
    suggestions,
    onApply,
    onCancel,
}: AISuggestionsPreviewProps) {
    const totalPrice = suggestions.reduce(
        (sum, s) => sum + parseFloat(s.price || "0"),
        0
    );

    const groupedByDay = suggestions.reduce((acc, suggestion) => {
        if (!acc[suggestion.day]) {
            acc[suggestion.day] = [];
        }
        acc[suggestion.day].push(suggestion);
        return acc;
    }, {} as Record<string, MenuSuggestion[]>);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">
                        Vista previa de sugerencias
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {suggestions.length} productos sugeridos • Precio total
                        estimado: {totalPrice.toFixed(2)}€
                    </p>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    <div className="space-y-4">
                        {Object.entries(groupedByDay).map(
                            ([day, daySuggestions]) => (
                                <div
                                    key={day}
                                    className="border rounded-lg p-3"
                                >
                                    <h3 className="font-semibold mb-2">
                                        {day}
                                    </h3>
                                    <div className="space-y-2">
                                        {daySuggestions.map(
                                            (suggestion, idx) => (
                                                <div
                                                    key={`${suggestion.productId}-${idx}`}
                                                    className="flex gap-3 bg-gray-50 p-2 rounded"
                                                >
                                                    <div className="relative w-16 h-16 flex-shrink-0">
                                                        <Image
                                                            src={
                                                                suggestion.thumbnail
                                                            }
                                                            alt={
                                                                suggestion.productName
                                                            }
                                                            fill
                                                            className="object-cover rounded"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {
                                                                        suggestion.productName
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-600 mt-0.5">
                                                                    {
                                                                        suggestion.mealType
                                                                    }
                                                                </p>
                                                            </div>
                                                            <span className="text-sm font-semibold text-green-700 flex-shrink-0">
                                                                {
                                                                    suggestion.price
                                                                }
                                                                €
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                            {suggestion.reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>

                <div className="p-4 border-t flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onApply}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Aplicar al calendario
                    </button>
                </div>
            </div>
        </div>
    );
}
