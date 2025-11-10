"use client";
import { ShoppingCart, Trash2, CreditCard, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type MealPlan = Record<string, string[]>
type DayPlan = Record<string, MealPlan>
type CartPlans = Record<string, DayPlan>

export default function CartPage() {
  const [plans, setPlans] = useState<CartPlans>({});
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  });
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (!raw) {
        setPlans({});
        return;
      }
      const parsed = JSON.parse(raw) as CartPlans;
      setPlans(parsed ?? {});
    } catch {
      setPlans({});
    }
  }, []);

  const removePlan = (planName: string) => {
    const next = { ...plans };
    delete next[planName];
    setPlans(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  const clearCart = () => {
    setPlans({});
    localStorage.removeItem("cart");
  };

  // simple derived values for display
  const planNames = Object.keys(plans);
  const totalProducts = planNames.reduce((acc, name) => {
    const dayPlan = plans[name] ?? {};
    for (const day of Object.keys(dayPlan)) {
      const meals = dayPlan[day] ?? {};
      for (const meal of Object.keys(meals)) {
        acc += (meals[meal] ?? []).length;
      }
    }
    return acc;
  }, 0);

  const envio = totalProducts > 0 ? 5 : 0;
  const subtotal = 0; // prices not available in stored plans
  const total = subtotal + envio;

  const isCartEmpty = planNames.length === 0;
  const isCardIncomplete =
    !cardData.number || !cardData.name || !cardData.expiry || !cardData.cvc;
  const canConfirm = !isCartEmpty && !isCardIncomplete;

  const handleConfirm = () => {
    if (!canConfirm) return;
    setIsConfirmed(true);
    clearCart();
  };

  return (
    <div className="min-h-screen bg-[#f2f7f3] text-gray-800">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" /> Tu carrito
        </h1>
        <Link
          href="/planes"
          className="text-sm text-green-700 hover:text-green-900 font-medium"
        >
          Seguir comprando
        </Link>
      </header>

      <main className="max-w-5xl mx-auto mt-8 p-4">
        {isConfirmed ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center max-w-lg mx-auto">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-green-700 mb-2">
              ¡Pedido confirmado!
            </h2>
            <p className="text-gray-600">
              Gracias por tu compra. Tu pedido ha sido registrado correctamente.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 bg-green-700 hover:bg-green-800 text-white py-3 px-6 rounded-lg font-medium transition"
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow">
                <h2 className="text-lg font-semibold mb-4">Tus menús</h2>

                {isCartEmpty ? (
                  <p className="text-gray-500 italic py-6">Tu carrito está vacío</p>
                ) : (
                  <div className="space-y-4">
                    {planNames.map((planName) => (
                      <div key={planName} className="border rounded p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-800">{planName}</div>
                            <div className="text-xs text-gray-500 mt-1">{/* summary */}{Object.keys(plans[planName]).length} días · {Object.values(plans[planName]).reduce((s, m) => s + Object.values(m).flat().length, 0)} productos</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="text-sm text-red-600 hover:underline"
                              onClick={() => removePlan(planName)}
                              aria-label={`Eliminar ${planName}`}
                            >
                              <Trash2 className="w-4 h-4 inline-block mr-1" /> Eliminar
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          {Object.keys(plans[planName]).map((day) => (
                            <div key={day} className="p-2 border rounded bg-gray-50">
                              <div className="font-medium">{day}</div>
                              <div className="mt-1 space-y-1">
                                {Object.entries(plans[planName][day]).map(([meal, items]) => (
                                  <div key={meal} className="text-xs">
                                    <div className="font-medium">{meal}</div>
                                    {items.length > 0 ? (
                                      <ul className="list-disc ml-4">
                                        {items.map((it, i) => (
                                          <li key={i}>{it}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <div className="text-slate-400">Sin productos</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow h-fit">
                <h2 className="text-lg font-semibold mb-4">Resumen del pedido</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Total productos</span>
                    <span>{totalProducts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gastos de envío</span>
                    <span>{envio.toFixed(2)} €</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total a pagar</span>
                    <span className="text-green-700">{total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-white p-8 rounded-2xl shadow max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-green-700">Finalizar compra</h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirm();
                }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium mb-2">Datos personales</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nombre completo" className="border rounded-lg p-3 w-full" />
                    <input type="email" placeholder="Correo electrónico" className="border rounded-lg p-3 w-full" />
                  </div>
                  <input type="text" placeholder="Dirección de envío" className="border rounded-lg p-3 w-full mt-4" />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Método de pago</h3>
                  <label className="flex items-center gap-2 border rounded-lg p-3 cursor-pointer w-full hover:border-green-500">
                    <input type="radio" name="payment" defaultChecked />
                    <CreditCard className="w-5 h-5 text-green-700" />
                    <span>Tarjeta de crédito</span>
                  </label>

                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Número de tarjeta"
                      className="border rounded-lg p-3 w-full"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Nombre en la tarjeta"
                      className="border rounded-lg p-3 w-full"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="border rounded-lg p-3 w-full"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      className="border rounded-lg p-3 w-full"
                      value={cardData.cvc}
                      onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canConfirm}
                  className={`w-full py-3 rounded-lg font-medium transition ${canConfirm ? "bg-green-700 hover:bg-green-800 text-white" : "bg-gray-300 cursor-not-allowed"}`}
                >
                  Finalizar compra
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
