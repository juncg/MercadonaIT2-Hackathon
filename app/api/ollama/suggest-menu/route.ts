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

        const systemPrompt = `Eres un asistente experto en nutrición que ayuda a crear menús semanales saludables.
Tu tarea es sugerir productos de Mercadona para un calendario de comidas.

PRODUCTOS DISPONIBLES:
${productsText}

REGLAS CRÍTICAS:
1. Responde ÚNICAMENTE con JSON válido, sin bloques de código markdown, sin texto antes o después
2. El JSON debe tener exactamente este formato: {"suggestions":[...]}
3. Cada sugerencia debe incluir: productId (string del listado), productName (string), price (number), mealType (string: "Desayuno" o "Comida" o "Cena"), day (string del día solicitado), reason (string breve)
4. NO incluyas el campo "thumbnail"
5. Asegúrate de que el JSON sea válido: sin comas finales, comillas correctas
6. Respeta las preferencias dietéticas y restricciones del usuario
7. Intenta mantenerte dentro del presupuesto si se especifica
8. Distribuye los productos de forma equilibrada entre los días

EJEMPLO DE RESPUESTA VÁLIDA:
{"suggestions":[{"productId":"1","productName":"Tortilla","price":4.5,"mealType":"Comida","day":"Lunes","reason":"Alta en proteínas"}]}`;

        const userPrompt = `Crea un menú para los siguientes días: ${days.join(
            ", "
        )}

Preferencias: ${preferences}
${dietaryRestrictions ? `Restricciones: ${dietaryRestrictions}` : ""}
${budget ? `Presupuesto: ${budget}€` : ""}

Sugiere 3 productos por día (uno por cada comida). Responde solo con el JSON.`;

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
                        temperature: 0.7,
                        num_predict: 1000,
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
                "[suggest-menu] Parsing response, first 200 chars:",
                content.substring(0, 200)
            );

            // Remover bloques de código markdown si existen
            content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "");

            // Intentar extraer el JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                let jsonStr = jsonMatch[0];

                // Limpiar posibles problemas comunes en el JSON
                jsonStr = jsonStr
                    .replace(/,(\s*[}\]])/g, "$1") // Remover comas finales
                    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // Remover caracteres de control

                console.log(
                    "[suggest-menu] Cleaned JSON, first 300 chars:",
                    jsonStr.substring(0, 300)
                );

                const parsed = JSON.parse(jsonStr);
                suggestions = parsed.suggestions || [];
                console.log(
                    "[suggest-menu] Parsed suggestions count:",
                    suggestions.length
                );
            } else {
                console.error("[suggest-menu] No JSON found in response");
                return NextResponse.json(
                    {
                        error: "No se pudo obtener una respuesta válida de la IA",
                        rawResponse: content,
                    },
                    { status: 500 }
                );
            }
        } catch (parseError) {
            console.error("[suggest-menu] Parse error:", parseError);
            return NextResponse.json(
                {
                    error: "Error al procesar la respuesta de la IA",
                    details:
                        parseError instanceof Error
                            ? parseError.message
                            : "Unknown error",
                    rawResponse: response.message.content,
                },
                { status: 500 }
            );
        }

        const validatedSuggestions = suggestions.map((s) => {
            const product = allProducts.find((p) => p.id === s.productId);

            if (!product) {
                console.warn(
                    `[suggest-menu] Product not found for ID: ${s.productId}`
                );
            }

            return {
                productId: s.productId,
                productName: product?.name || s.productName,
                price: product?.price.toString() || s.price,
                thumbnail: product?.image || "",
                mealType: s.mealType,
                day: s.day,
                reason: s.reason,
            };
        });

        console.log(
            "[suggest-menu] Returning validated suggestions:",
            validatedSuggestions.length
        );

        console.log("[suggest-menu] Sample suggestion with image:", {
            productName: validatedSuggestions[0]?.productName,
            thumbnail: validatedSuggestions[0]?.thumbnail,
            hasImage: !!validatedSuggestions[0]?.thumbnail,
        });

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
