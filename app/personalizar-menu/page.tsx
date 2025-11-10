"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { MenuChat } from "@/components/menu-chat";
import { MenuSummary } from "@/components/menu-summary";
import { ProductGrid } from "@/components/product-card";
import { MenuSuggestion, MercadonaProduct } from "@/lib/menu-types";
import { getMercadonaProducts, getProductById } from "@/lib/mercadona-products";
import { useMenu } from "@/lib/use-menu";
import { useEffect } from "react";

const CATEGORIES = [
    { id: "all", name: "Todos los productos" },
    { id: "breakfast", name: "Desayunos" },
    { id: "main-dishes", name: "Platos Principales" },
    { id: "ready-meals", name: "Comidas Listas" },
    { id: "snacks", name: "Aperitivos" },
    { id: "sides", name: "Acompañamientos" },
    { id: "desserts", name: "Postres" },
    { id: "beverages", name: "Bebidas" },
];

export default function PersonalizarMenu() {
    const {
        menu,
        totalItems,
        totalPrice,
        menuItems,
        addProduct,
        removeProduct,
        clearProduct,
        clearMenu,
    } = useMenu();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [activeTab, setActiveTab] = useState("products");
    const [allProducts, setAllProducts] = useState<MercadonaProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true);
            try {
                const products = await getMercadonaProducts();
                setAllProducts(products);
            } catch (error) {
                console.error("Error loading products:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        let products = allProducts;

        // Filtrar por categoría
        if (selectedCategory !== "all") {
            products = products.filter((p) => p.category === selectedCategory);
        }

        // Filtrar por búsqueda
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            products = products.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.category.toLowerCase().includes(query)
            );
        }

        return products;
    }, [selectedCategory, searchQuery, allProducts]);

    const handleAddProduct = (product: MercadonaProduct) => {
        addProduct(product);
    };

    const handleRemoveProduct = (productId: string) => {
        removeProduct(productId);
    };

    const handleApplySuggestion = async (suggestion: MenuSuggestion) => {
        const product = await getProductById(suggestion.productId);
        if (!product) return;

        if (suggestion.action === "add") {
            addProduct(product, suggestion.quantity || 1);
        } else if (suggestion.action === "remove") {
            removeProduct(suggestion.productId, suggestion.quantity || 1);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <ChefHat className="h-8 w-8 text-green-600" />
                    <h1 className="text-3xl font-bold">
                        Planes Alimenticios Completos Mercadona
                    </h1>
                </div>
                <p className="text-muted-foreground text-lg">
                    Diseña planes alimenticios completos con platos
                    precocinados, postres y productos listos de Mercadona.
                    Perfecto para desayunos, almuerzos, comidas y cenas sin
                    complicaciones.
                </p>
            </div>

            <Tabs
                defaultValue="chat"
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
            >
                <TabsList className="grid grid-cols-2 w-full max-w-md">
                    <TabsTrigger value="chat">
                        🍽️ Chef de plan alimenticio
                    </TabsTrigger>
                    <TabsTrigger value="products">🛒 Productos</TabsTrigger>
                </TabsList>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Panel principal */}
                    <div className="lg:col-span-2">
                        <TabsContent value="products" className="mt-0">
                            <div className="space-y-6">
                                {/* Filtros y búsqueda */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar productos..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="pl-10"
                                        />
                                    </div>
                                    <Select
                                        value={selectedCategory}
                                        onValueChange={setSelectedCategory}
                                    >
                                        <SelectTrigger className="w-full sm:w-48">
                                            <Filter className="h-4 w-4 mr-2" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Resumen de filtros */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-muted-foreground">
                                        Mostrando {filteredProducts.length}{" "}
                                        productos
                                    </span>
                                    {searchQuery && (
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            Búsqueda: &quot;{searchQuery}&quot;
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setSearchQuery("")
                                                }
                                                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                            >
                                                ×
                                            </Button>
                                        </Badge>
                                    )}
                                    {selectedCategory !== "all" && (
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            {
                                                CATEGORIES.find(
                                                    (c) =>
                                                        c.id ===
                                                        selectedCategory
                                                )?.name
                                            }
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedCategory("all")
                                                }
                                                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                            >
                                                ×
                                            </Button>
                                        </Badge>
                                    )}
                                </div>

                                {/* Grid de productos */}
                                {isLoading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                        <p className="text-muted-foreground">
                                            Cargando productos...
                                        </p>
                                    </div>
                                ) : filteredProducts.length > 0 ? (
                                    <ProductGrid
                                        products={filteredProducts}
                                        menuItems={menu}
                                        onAddProduct={handleAddProduct}
                                        onRemoveProduct={handleRemoveProduct}
                                    />
                                ) : (
                                    <div className="text-center py-12">
                                        <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            No se encontraron productos
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Intenta con otros términos de
                                            búsqueda o cambia la categoría
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="chat" className="mt-0">
                            <MenuChat
                                currentMenu={menu}
                                onApplySuggestion={handleApplySuggestion}
                            />
                        </TabsContent>
                    </div>

                    {/* Panel lateral - Resumen del menú */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <MenuSummary
                                menuItems={menuItems}
                                totalPrice={totalPrice}
                                totalItems={totalItems}
                                onAddProduct={async (productId) => {
                                    const product = await getProductById(
                                        productId
                                    );
                                    if (product) addProduct(product);
                                }}
                                onRemoveProduct={handleRemoveProduct}
                                onClearProduct={clearProduct}
                                onClearMenu={clearMenu}
                            />
                        </div>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
