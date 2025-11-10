import { Database } from "@/database.types";
import { MercadonaProduct } from "@/lib/menu-types";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://pmqsrzljxvrnyvwyothc.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function getAlimentos() {
    const { data } = await supabase.from("Alimentos").select("nombre");

    return data;
}

export async function getMercadonaProducts(): Promise<MercadonaProduct[]> {
    const { data, error } = await supabase
        .from("Alimentos")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Error obteniendo productos:", error);
        return [];
    }

    return (
        data?.map((product) => ({
            id: product.id?.toString() || "",
            name: product.name || "",
            price: product.price || 0,
            category:
                (product.category as MercadonaProduct["category"]) ||
                "ready-meals",
            image: product.image || undefined,
            description: product.description || undefined,
            allergens: product.allergens || undefined,
            nutritionalInfo: product.nutritionalInfo || undefined,
        })) || []
    );
}

export async function getProductsByCategory(
    category: MercadonaProduct["category"]
): Promise<MercadonaProduct[]> {
    const { data, error } = await supabase
        .from("Alimentos")
        .select("*")
        .eq("category", category)
        .order("id", { ascending: true });

    if (error) {
        console.error("Error obteniendo productos por categoría:", error);
        return [];
    }

    return (
        data?.map((product) => ({
            id: product.id?.toString() || "",
            name: product.name || "",
            price: product.price || 0,
            category:
                (product.category as MercadonaProduct["category"]) ||
                "ready-meals",
            image: product.image || undefined,
            description: product.description || undefined,
            allergens: product.allergens || undefined,
            nutritionalInfo: product.nutritionalInfo || undefined,
        })) || []
    );
}

export async function getProductById(
    id: string
): Promise<MercadonaProduct | null> {
    const { data, error } = await supabase
        .from("Alimentos")
        .select("*")
        .eq("id", parseInt(id))
        .single();

    if (error) {
        console.error("Error obteniendo producto por ID:", error);
        return null;
    }

    if (!data) return null;

    return {
        id: data.id?.toString() || "",
        name: data.name || "",
        price: data.price || 0,
        category:
            (data.category as MercadonaProduct["category"]) || "ready-meals",
        image: data.image || undefined,
        description: data.description || undefined,
        allergens: data.allergens || undefined,
        nutritionalInfo: data.nutritionalInfo || undefined,
    };
}

export async function searchProducts(
    query: string
): Promise<MercadonaProduct[]> {
    const { data, error } = await supabase
        .from("Alimentos")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("id", { ascending: true });

    if (error) {
        console.error("Error buscando productos:", error);
        return [];
    }

    return (
        data?.map((product) => ({
            id: product.id?.toString() || "",
            name: product.name || "",
            price: product.price || 0,
            category:
                (product.category as MercadonaProduct["category"]) ||
                "ready-meals",
            image: product.image || undefined,
            description: product.description || undefined,
            allergens: product.allergens || undefined,
            nutritionalInfo: product.nutritionalInfo || undefined,
        })) || []
    );
}

export async function getProducts() {
    const response = await fetch(
        "https://tienda.mercadona.es/api/categories/897/"
    );

    const categories = await response.json();

    return categories;
}
