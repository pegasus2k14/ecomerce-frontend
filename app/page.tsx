'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, Producto, getErrorMessage } from './lib/api';
import { useAuth } from './context/AuthContext';
import { AuthBox } from './components/AuthBox';
import  {PostForm}  from './components/PostForm';
import  {PostCard}  from './components/PostCard';

type CartItem = {
  producto: Producto;
  cantidad: number;
};

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carrito, setCarrito] = useState<CartItem[]>([]);

  // Función reutilizable para recargar después de crear/editar/eliminar
  const reloadPosts = useCallback(async () => {
    try {
      const res = await api.getPosts();
      setProductos(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  // Carga inicial controlada
  useEffect(() => {
    let isMounted = true;

    const fetchInitialPosts = async () => {
      try {
        setLoading(true);
        const res = await api.getPosts();
        if (isMounted) {
          setProductos(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.deleteProductos(id);
      await reloadPosts();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const agregarAlCarrito = (producto: Producto) => {
  setCarrito((actual) => {
    const existente = actual.find(
      (item) => item.producto.id === producto.id
    );

    if (!existente) {
      return producto.stock > 0
        ? [...actual, { producto, cantidad: 1 }]
        : actual;
    }

    // No agregar más unidades de las disponibles
    if (existente.cantidad >= producto.stock) {
      return actual;
    }

    return actual.map((item) =>
      item.producto.id === producto.id
        ? { ...item, producto, cantidad: item.cantidad + 1 }
        : item
    );
  });
};

const quitarDelCarrito = (productoId: number) => {
  setCarrito((actual) =>
    actual.filter((item) => item.producto.id !== productoId)
  );
};

const totalCarrito = carrito.reduce(
  (total, item) => total + Number(item.producto.price) * item.cantidad,
  0
);


  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Login / Registro */}
      <AuthBox onError={setError} />

      {/* Formulario (solo visible si está autenticado) */}
{isAuthenticated && (
  <PostForm
    editingProducto={editingProducto}
    onSaved={() => {
      setEditingProducto(null);
      reloadPosts();
    }}
    onCancelEdit={() => setEditingProducto(null)}
    onError={setError}
  />
)}

      {/* Lista de Posts */}
      <section className="space-y-3">
        <h2 className="font-bold text-slate-800 text-lg">Productos</h2>
        {loading ? (
          <p className="text-sm text-slate-400">Cargando...</p>
        ) : productos.length === 0 ? (
          <p className="text-sm text-slate-400">No hay productos.</p>
        ) : (
          productos.map((producto) => (
            <PostCard
              key={producto.id}
              producto={producto}
              onEdit={setEditingProducto}
              onDelete={handleDelete}
              onAddToCart={agregarAlCarrito}
            />
          ))
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
         <h2 className="mb-3 font-bold text-black">Carrito ({carrito.length})</h2>

        {carrito.length === 0 ? (
          <p className="text-sm text-slate-500 color-slate-500 text-black">El carrito está vacío.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {carrito.map(({ producto, cantidad }) => (
                <li
                  key={producto.id}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-sm text-slate-700">
                    {producto.name} × {cantidad} — $
                    {(Number(producto.price) * cantidad).toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => quitarDelCarrito(producto.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-right font-bold text-black">
              Total: ${totalCarrito.toFixed(2)}
            </p>
          </>
        )}
      </section>
    </div>
  );
}