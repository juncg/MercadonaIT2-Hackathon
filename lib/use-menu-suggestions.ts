import { useState } from "react";

export interface MenuSuggestion {
    productId: string;
    productName: string;
    price: string;
    thumbnail: string;
    mealType: "Desayuno" | "Comida" | "Cena";
    day: string;
    reason: string;
}

interface MenuSuggestionsRequest {
    preferences: string;
    dietaryRestrictions?: string;
    budget?: number;
    days: string[];
    model?: string;
}

interface MenuSuggestionsResponse {
    success: boolean;
    suggestions: MenuSuggestion[];
    totalSuggestions: number;
    error?: string;
}

export function useMenuSuggestions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<MenuSuggestion[]>([]);

    const getSuggestions = async (request: MenuSuggestionsRequest) => {
        setLoading(true);
        setError(null);

        try {
            console.log("[useMenuSuggestions] Fetching suggestions...");

            const response = await fetch("/api/ollama/suggest-menu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request),
            });

            console.log(
                "[useMenuSuggestions] Response status:",
                response.status
            );

            const data: MenuSuggestionsResponse = await response.json();

            console.log("[useMenuSuggestions] Response data:", {
                success: data.success,
                suggestionsCount: data.suggestions?.length,
                error: data.error,
            });

            if (!response.ok) {
                throw new Error(data.error || "Error al obtener sugerencias");
            }

            setSuggestions(data.suggestions);
            return data.suggestions;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Error desconocido";
            console.error("[useMenuSuggestions] Error:", errorMessage);
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const clearSuggestions = () => {
        setSuggestions([]);
        setError(null);
    };

    return {
        loading,
        error,
        suggestions,
        getSuggestions,
        clearSuggestions,
    };
}
