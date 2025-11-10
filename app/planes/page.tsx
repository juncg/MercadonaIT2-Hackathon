import { ExpandableGrid } from "@/components/expandable-grid";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import UserPlansGrid from "@/components/user-plans-grid";

export default function Planes() {
    const buildPlan = (title: string, mainForMeal: { desayuno?: string[]; comida?: string[]; cena?: string[] }) => {
        const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        const MEALS = ["Desayuno", "Comida", "Cena"];
        const plan: Record<string, Record<string, Record<string, string[]>>> = {};
        plan[title] = {};
        for (const day of DAYS) {
            plan[title][day] = {};
            plan[title][day]["Desayuno"] = mainForMeal.desayuno ?? [];
            plan[title][day]["Comida"] = mainForMeal.comida ?? [];
            plan[title][day]["Cena"] = mainForMeal.cena ?? [];
        }
        return plan;
    };

    const mediterraneoPlan = buildPlan("Plan Mediterráneo", {
        desayuno: ["Tostada Integral"],
        comida: ["Ensalada Mediterránea"],
        cena: ["Pescado al Horno"],
    });

    const vegetarianoPlan = buildPlan("Plan Vegetariano", {
        desayuno: ["Yogur con Muesli"],
        comida: ["Pasta con Verduras"],
        cena: ["Verduras Salteadas"],
    });

    const gridItems = [
        {
            id: "1",
            title: "Plan Mediterráneo",
            imageUrl: "/plan-mediterraneo.jpg",
            expandedContent:
                "Un plan de alimentación mediterránea saludable con verduras frescas, aceite de oliva y proteínas magras. Perfecto para un estilo de vida equilibrado. ",
            actionHref: `/calendario?planData=${encodeURIComponent(JSON.stringify(mediterraneoPlan))}`,
        },
        {
            id: "2",
            title: "Plan Vegetariano",
            imageUrl: "/plan-vegetariano.jpeg",
            expandedContent:
                "Comida vegetariana, llena de nutrientes y sabor. La mejor para el tipo de persona que valora el medio ambiente. Excelente para la salud y el cuidado del medio ambiente.",
            actionHref: `/calendario?planData=${encodeURIComponent(JSON.stringify(vegetarianoPlan))}`,
        },
        {
            id: "3",
            title: "Plan Casero",
            imageUrl: "/plan-casero.jpg",
            expandedContent:
                "Comidas caseras como las de la abuela, exactamente como las recuerdas.",
            actionHref: `/calendario?planData=${encodeURIComponent(JSON.stringify(buildPlan("Plan Casero", { comida: ["Arroz Integral"], cena: ["Sopa Ligera"] })))}`,
        },
        {
            id: "4",
            title: "Plan Kids",
            imageUrl: "/plan-kids.jpg",
            expandedContent:
                "Platos aptos para niños que encantan a toda la familia. Opciones nutritivas y deliciosas para todos.",
            actionHref: `/calendario?planData=${encodeURIComponent(JSON.stringify(buildPlan("Plan Kids", { desayuno: ["Yogur con Muesli"], comida: ["Pasta con Verduras"] })))}`,
        },
        {
            id: "5",
            title: "Plan Gourmet",
            imageUrl: "/plan-gourmet.jpg",
            expandedContent:
                "Experiencias culinarias elevadas con ingredientes premium y sabores sofisticados.",
            actionHref: `/calendario?planData=${encodeURIComponent(JSON.stringify(buildPlan("Plan Gourmet", { comida: ["Pescado al Horno"], cena: ["Pescado al Horno"] })))}`,
        },
        {
            id: "6",
            title: "Plan de Temporada",
            imageUrl: "/plan-de-temporada.jpeg",
            expandedContent:
                "Ingredientes de temporada que celebran lo mejor de cada época del año.",
            actionHref: `/calendario?planData=${encodeURIComponent(JSON.stringify(buildPlan("Plan de Temporada", { comida: ["Ensalada Mediterránea"] })))}`,
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

                <h1 className="text-2xl font-semibold mb-4 mt-25">
                    O si ninguno de nuestros planes te convence, crea el tuyo:
                </h1>

                <Button
                    size="lg"
                    className="bg-mercadona-green hover:bg-mercadona-green/90 text-lg px-4 w-full"
                >
                    <Link
                        className="flex items-center"
                        href={"/calendario"}
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Crea tu Plan Alimenticio
                    </Link>
                </Button>
                <UserPlansGrid />
            </section>
        </div>
    );
}
