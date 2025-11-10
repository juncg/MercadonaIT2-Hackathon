import { ExpandableGrid } from "@/components/expandable-grid";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function Planes() {
    const gridItems = [
        {
            id: "1",
            title: "Plan Mediterráneo",
            imageUrl: "/plan-mediterraneo.jpg",
            expandedContent:
                "Un plan de alimentación mediterránea saludable con verduras frescas, aceite de oliva y proteínas magras. Perfecto para un estilo de vida equilibrado.",
        },
        {
            id: "2",
            title: "Plan Vegetariano",
            imageUrl: "/plan-vegetariano.jpeg",
            expandedContent:
                "Comida vegetariana, llena de nutrientes y sabor. Excelente para la salud y el cuidado del medio ambiente.",
        },
        {
            id: "3",
            title: "Plan Casero",
            imageUrl: "/plan-casero.jpg",
            expandedContent:
                "Comidas caseras como las de la abuela, exactamente como las recuerdas.",
        },
        {
            id: "4",
            title: "Plan Kids",
            imageUrl: "/plan-kids.jpg",
            expandedContent:
                "Platos aptos para niños que encantan a toda la familia. Opciones nutritivas y deliciosas para todos.",
        },
        {
            id: "5",
            title: "Plan Gourmet",
            imageUrl: "/plan-gourmet.jpg",
            expandedContent:
                "Experiencias culinarias elevadas con ingredientes premium y sabores sofisticados.",
        },
        {
            id: "6",
            title: "Plan de Temporada",
            imageUrl: "/plan-de-temporada.jpeg",
            expandedContent:
                "Ingredientes de temporada que celebran lo mejor de cada época del año.",
        },
    ];

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <section className="bg-card rounded-lg p-8 shadow-sm">
                <h1 className="text-2xl font-semibold mb-4">
                    Planes de Alimenticios
                </h1>

                <p className="text-muted-foreground mb-8">
                    ¡Explora nuestros planes para encontrar el que mejor se adapte a ti!
                </p>

                <ExpandableGrid items={gridItems} />

                <h1 className="text-2xl font-semibold mb-4 mt-16">
                    O si ninguno de nuestros planes te convence, personaliza el tuyo:
                </h1>

                <Button
                    size="lg"
                    className="bg-mercadona-green hover:bg-mercadona-green/90 text-lg px-4 w-full"
                >
                    <Link
                        className="flex items-center"
                        href={"/personalizar-menu"}
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Personaliza tu Plan Alimenticio
                    </Link>
                </Button>
            </section>
        </div>
    );
}
