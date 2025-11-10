import { getMercadonaProducts as getProductsFromDB } from "@/supabase/services";
import { MercadonaProduct } from "./menu-types";

export async function getMercadonaProducts(): Promise<MercadonaProduct[]> {
    return await getProductsFromDB();
}

export const getProductsByCategory = async (
    category: MercadonaProduct["category"]
): Promise<MercadonaProduct[]> => {
    const { getProductsByCategory: getByCategoryFromDB } = await import(
        "@/supabase/services"
    );
    return await getByCategoryFromDB(category);
};

export const getProductById = async (
    id: string
): Promise<MercadonaProduct | null> => {
    const { getProductById: getByIdFromDB } = await import(
        "@/supabase/services"
    );
    return await getByIdFromDB(id);
};

export const searchProducts = async (
    query: string
): Promise<MercadonaProduct[]> => {
    const { searchProducts: searchInDB } = await import("@/supabase/services");
    return await searchInDB(query);
};
