"use client";
import { ShoppingCart, Trash2, CreditCard, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Menú Mediterráneo", price: 27.5, quantity: 1 }, // Precio con IVA incluido
    { id: 2, name: "Menú Vegano", price: 24.75, quantity: 2 }, // Precio con IVA incluido
  ]);

  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  });

  const [isConfirmed, setIsConfirmed] = useState(false);

  // Calcular totales (IVA incluido en precios)
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const envio = subtotal > 0 ? 5 : 0;
  const total = subtotal + envio;

  // Calcular el IVA incluido (aprox 10%)
  const ivaIncluido = subtotal - subtotal / 1.1; // desglosar el IVA que está dentro del subtotal

  // Validaciones
  const isCartEmpty = cartItems.length === 0;
  const isCardIncomplete =
    !cardData.number || !cardData.name || !cardData.expiry || !cardData.cvc;
  const canConfirm = !isCartEmpty && !isCardIncomplete;

  // Manejar cambio de cantidad
  const handleQuantityChange = (id: number, newQty: number) => {
    if (newQty < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      )
    );
  };

  // Acción al confirmar pedido
  const handleConfirm = () => {
    if (canConfirm) {
      setIsConfirmed(true);
      setCartItems([]); // Vacía el carrito (opcional)
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f7f3] text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" /> Tu carrito
        </h1>
        <a
          href="/"
          className="text-sm text-green-700 hover:text-green-900 font-medium"
        >
          Seguir comprando
        </a>
      </header>

      {/* Contenido principal */}
      <main className="max-w-5xl mx-auto mt-8 p-4">
        {isConfirmed ? (
          // ✅ Confirmación de pedido
          <div className="bg-white p-10 rounded-2xl shadow text-center max-w-lg mx-auto">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-green-700 mb-2">
              ¡Pedido confirmado!
            </h2>
            <p className="text-gray-600">
              Gracias por tu compra. Tu pedido ha sido registrado correctamente.
              Recibirás un correo con los detalles.
            </p>
            <a
              href="/"
              className="inline-block mt-6 bg-green-700 hover:bg-green-800 text-white py-3 px-6 rounded-lg font-medium transition"
            >
              Volver al inicio
            </a>
          </div>
        ) : (
          <>
            {/* Lista de productos + resumen */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow">
                <h2 className="text-lg font-semibold mb-4">Tus menús</h2>
                {cartItems.length > 0 ? (
                  <div className="divide-y">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-4"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.price.toFixed(2)} € (IVA incl.)
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                Number(e.target.value)
                              )
                            }
                            className="w-16 border rounded-lg text-center"
                          />
                          <p className="w-20 text-right font-semibold">
                            {(item.price * item.quantity).toFixed(2)} €
                          </p>
                          <button
                            className="text-gray-400 hover:text-red-500"
                            onClick={() =>
                              setCartItems((prev) =>
                                prev.filter((p) => p.id !== item.id)
                              )
                            }
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic py-6">
                    Tu carrito está vacío 
                  </p>
                )}
              </div>

              {/* 🧾 Resumen del pedido */}
              <div className="bg-white p-6 rounded-2xl shadow h-fit">
                <h2 className="text-lg font-semibold mb-4">
                  Resumen del pedido
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal (IVA incl.)</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Incluye IVA (10%)</span>
                    <span>{ivaIncluido.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gastos de envío</span>
                    <span>{envio.toFixed(2)} €</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total a pagar</span>
                    <span className="text-green-700">
                      {total.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout */}
            <div className="mt-10 bg-white p-8 rounded-2xl shadow max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-green-700">
                Finalizar compra
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirm();
                }}
                className="space-y-6"
              >
                {/* Datos personales */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Datos personales</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      className="border rounded-lg p-3 w-full"
                    />
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      className="border rounded-lg p-3 w-full"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Dirección de envío"
                    className="border rounded-lg p-3 w-full mt-4"
                  />
                </div>

                {/* Método de pago */}
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
                      onChange={(e) =>
                        setCardData({ ...cardData, number: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Nombre en la tarjeta"
                      className="border rounded-lg p-3 w-full"
                      value={cardData.name}
                      onChange={(e) =>
                        setCardData({ ...cardData, name: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="border rounded-lg p-3 w-full"
                      value={cardData.expiry}
                      onChange={(e) =>
                        setCardData({ ...cardData, expiry: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      className="border rounded-lg p-3 w-full"
                      value={cardData.cvc}
                      onChange={(e) =>
                        setCardData({ ...cardData, cvc: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Botón único */}
                <button
                  type="submit"
                  disabled={!canConfirm}
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    canConfirm
                      ? "bg-green-700 hover:bg-green-800 text-white"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
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
