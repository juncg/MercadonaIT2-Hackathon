import { getMercadonaProducts } from "@/supabase/services";
import { NextRequest, NextResponse } from "next/server";

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434";

interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
    category: string;
}

interface MenuSuggestion {
    productId: string;
    productName: string;
    price: string;
    thumbnail: string;
    mealType: "Desayuno" | "Comida" | "Cena";
    day: string;
    reason: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            preferences,
            dietaryRestrictions,
            budget,
            days,
            model = "gemma3:1b",
        } = body;

        console.log("[suggest-menu] Request received:", {
            preferences: preferences?.substring(0, 50),
            days,
            model,
        });

        if (!preferences || !days || days.length === 0) {
            return NextResponse.json(
                { error: "Preferences and days are required" },
                { status: 400 }
            );
        }

        console.log("[suggest-menu] Fetching products from Supabase...");
        const supabaseProducts = await getMercadonaProducts();

        if (!supabaseProducts || supabaseProducts.length === 0) {
            return NextResponse.json(
                { error: "No products found in database" },
                { status: 500 }
            );
        }

        const allProducts: Product[] = supabaseProducts.map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
        }));

        console.log("[suggest-menu] Loaded products:", allProducts.length);

        const productsText = allProducts
            .map(
                (p, idx) =>
                    `${idx + 1}. ID: ${p.id}, Nombre: ${p.name}, Precio: ${
                        p.price
                    }€, Categoría: ${p.category}`
            )
            .join("\n");

        const systemPrompt = `Eres un asistente de nutrición. Responde SOLO con JSON válido.

PRODUCTOS DISPONIBLES (usa solo estos IDs):
${productsText}

FORMATO DE RESPUESTA (copia exactamente esta estructura):
{"suggestions":[{"productId":"ID_DEL_PRODUCTO","productName":"Nombre","price":5.99,"mealType":"Desayuno","day":"Lunes","reason":"Motivo"}]}

REGLAS:
1. Usa solo productId de la lista de productos
2. mealType debe ser: "Desayuno", "Comida" o "Cena"
3. day debe ser uno de los días solicitados
4. price debe ser un número
5. NO agregues texto explicativo, SOLO el JSON
6. Sugiere 3 productos por día (1 por comida)`;

        const userPrompt = `Días: ${days.join(", ")}
Preferencias: ${preferences}
${dietaryRestrictions ? `Restricciones: ${dietaryRestrictions}` : ""}
${budget ? `Presupuesto: ${budget}€` : ""}`;

        console.log("[suggest-menu] Calling Ollama with model:", model);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000);

        let response;

        try {
            const ollamaResponse = await fetch(`${OLLAMA_API_URL}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt,
                        },
                        {
                            role: "user",
                            content: userPrompt,
                        },
                    ],
                    stream: false,
                    options: {
                        temperature: 0.3,
                        num_predict: 800,
                    },
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!ollamaResponse.ok) {
                const errorText = await ollamaResponse.text();
                console.error("[suggest-menu] Ollama error:", errorText);
                return NextResponse.json(
                    { error: `Ollama API error: ${errorText}` },
                    { status: ollamaResponse.status }
                );
            }

            response = await ollamaResponse.json();
        } catch (fetchError) {
            clearTimeout(timeoutId);

            if (
                fetchError instanceof Error &&
                fetchError.name === "AbortError"
            ) {
                console.error(
                    "[suggest-menu] Timeout: Ollama took too long to respond"
                );
                return NextResponse.json(
                    {
                        error: "El modelo de IA tardó demasiado. Intenta con menos días o un modelo más rápido.",
                    },
                    { status: 504 }
                );
            }

            console.error("[suggest-menu] Fetch error:", fetchError);
            throw fetchError;
        }

        console.log(
            "[suggest-menu] Ollama response received, length:",
            response.message.content.length
        );

        let suggestions: MenuSuggestion[] = [];

        try {
            let content = response.message.content.trim();
            console.log(
                "[suggest-menu] Raw response:",
                content.substring(0, 300)
            );

            content = content
                .replace(/```json\s*/g, "")
                .replace(/```\s*/g, "")
                .trim();

            const allSuggestions: MenuSuggestion[] = [];
            const suggestionMatches = content.matchAll(
                /\{"productId":"(\d+)","productName":"([^"]+)","price":([\d.]+),"mealType":"([^"]+)","day":"([^"]+)","reason":"([^"]+)"[^}]*\}/g
            );

            let matchCount = 0;
            for (const match of suggestionMatches) {
                matchCount++;
                try {
                    const suggestion: MenuSuggestion = {
                        productId: match[1],
                        productName: match[2],
                        price: match[3],
                        thumbnail: "",
                        mealType: match[4] as "Desayuno" | "Comida" | "Cena",
                        day: match[5],
                        reason: match[6],
                    };
                    allSuggestions.push(suggestion);
                } catch (innerError) {
                    console.warn(
                        "[suggest-menu] Failed to parse suggestion:",
                        innerError
                    );
                }
            }

            console.log(
                `[suggest-menu] Found ${matchCount} suggestion object(s)`
            );

            if (allSuggestions.length === 0) {
                const jsonObjects = content.match(
                    /\{"suggestions":\s*\[[^\]]*\]/g
                );

                if (jsonObjects && jsonObjects.length > 0) {
                    console.log(
                        `[suggest-menu] Fallback: Found ${jsonObjects.length} JSON object(s)`
                    );

                    for (const jsonStr of jsonObjects) {
                        try {
                            const completeJson = jsonStr.endsWith("}")
                                ? jsonStr
                                : jsonStr + "}";

                            const cleanedJson = completeJson
                                .replace(/,\s*,/g, ",")
                                .replace(/,(\s*[}\]])/g, "$1")
                                .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
                                .replace(
                                    /"(preference|restriction|budget|restricciones)":\s*[^,}\]]+,?/g,
                                    ""
                                )
                                .replace(/"day":"[^"]*",?"day":/g, '"day":');

                            console.log(
                                "[suggest-menu] Processing JSON:",
                                cleanedJson.substring(0, 200)
                            );

                            const parsed = JSON.parse(cleanedJson);
                            if (
                                parsed.suggestions &&
                                Array.isArray(parsed.suggestions)
                            ) {
                                allSuggestions.push(...parsed.suggestions);
                            }
                        } catch (innerError) {
                            console.warn(
                                "[suggest-menu] Failed to parse JSON object:",
                                innerError,
                                "- Skipping"
                            );
                        }
                    }
                }
            }

            suggestions = allSuggestions;

            console.log(
                "[suggest-menu] Parsed suggestions:",
                suggestions.length
            );

            if (suggestions.length === 0) {
                console.error("[suggest-menu] No valid suggestions extracted");
                return NextResponse.json(
                    {
                        error: "La IA no generó sugerencias válidas. Intenta de nuevo.",
                        rawResponse: content,
                    },
                    { status: 500 }
                );
            }
        } catch (parseError) {
            console.error("[suggest-menu] Parse error:", parseError);
            return NextResponse.json(
                {
                    error: "Error al procesar la respuesta de la IA. Intenta de nuevo.",
                    details:
                        parseError instanceof Error
                            ? parseError.message
                            : "Unknown error",
                },
                { status: 500 }
            );
        }

        const validatedSuggestions = suggestions
            .map((s) => {
                const product = allProducts.find((p) => p.id === s.productId);

                if (!product) {
                    console.warn(
                        `[suggest-menu] Product not found for ID: ${s.productId}, skipping`
                    );
                    return null;
                }

                return {
                    productId: product.id,
                    productName: product.name,
                    price: product.price.toString(),
                    thumbnail: product.image || "",
                    mealType: s.mealType,
                    day: s.day,
                    reason: s.reason || "Sugerido por IA",
                };
            })
            .filter((s): s is NonNullable<typeof s> => s !== null);

        console.log(
            "[suggest-menu] Returning",
            validatedSuggestions.length,
            "validated suggestions"
        );

        return NextResponse.json({
            success: true,
            suggestions: validatedSuggestions,
            totalSuggestions: validatedSuggestions.length,
        });
    } catch (error) {
        console.error("Error in suggest-menu endpoint:", error);

        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;

        console.error("[suggest-menu] Error details:", {
            message: errorMessage,
            stack: errorStack,
        });

        return NextResponse.json(
            {
                error: "Internal server error",
                details: errorMessage,
            },
            { status: 500 }
        );
    }
}
