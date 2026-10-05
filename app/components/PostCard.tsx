'use client';

import { useEffect, useRef, useState } from 'react';
import { Producto } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface PostCardProps {
  producto: Producto;
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
  onAddToCart: (producto: Producto) => void;
}

export function PostCard({ producto, onEdit, onDelete,  onAddToCart }: PostCardProps) {
  const { isAuthenticated } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const detailsDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = detailsDialogRef.current;
    if (!dialog) return;

    if (showDetails && !dialog.open) {
      dialog.showModal();
    } else if (!showDetails && dialog.open) {
      dialog.close();
    }
  }, [showDetails]);

  return (
    <article className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-slate-900">{producto.name}</h3>
        <span className="text-xs bg-slate-100 text-black px-2 py-0.5 rounded">#{producto.id}</span>
      </div>
      <label className="text-xs text-slate-400">
        Descripción:
      </label>
      <p className="text-sm text-slate-700 whitespace-pre-line">{producto.description}</p>
        <label className="text-xs text-slate-400">
        Precio:
      </label>
      <p className="text-lg font-bold text-emerald-600">${producto.price}</p>
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-100">
        <span>Autor: {producto.user?.name || `Usuario #${producto.user_id}`}</span>
        {isAuthenticated && (
          <div className="flex gap-3">
            <button type="button" onClick={() => onAddToCart(producto)} disabled={producto.stock <= 0}
              className="rounded bg-emerald-600 px-3 py-2 text-sm text-white disabled:opacity-50">
                 {producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
            </button>
            <button onClick={() => setShowDetails(true)} className="text-blue-600 hover:underline">
              Ver detalle
            </button>
            <button onClick={() => onEdit(producto)} className="text-blue-600 hover:underline">
              Editar
            </button>
            <button onClick={() => onDelete(producto.id)} className="text-red-600 hover:underline">
              Eliminar
            </button>
          </div>
        )}
      </div>
      <dialog
        ref={detailsDialogRef}
        aria-labelledby={`product-details-title-${producto.id}`}
        onClose={() => setShowDetails(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            detailsDialogRef.current?.close();
          }
        }}
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-lg border-0 bg-white p-0 shadow-xl backdrop:bg-black/50"
      >
        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">Producto #{producto.id}</p>
              <h2 id={`product-details-title-${producto.id}`} className="text-xl font-bold text-slate-900">
                {producto.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => detailsDialogRef.current?.close()}
              className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Cerrar detalles"
            >
              Cerrar
            </button>
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            <p><span className="font-semibold">Descripción:</span> {producto.description}</p>
            <p><span className="font-semibold">Precio:</span> ${producto.price}</p>
            <p><span className="font-semibold">Stock:</span> {producto.stock}</p>
             {/*<p><span className="font-semibold">Autor:</span> {producto.user?.name || `Usuario #${producto.user_id}`}</p>*/}
          </div>
        </div>
      </dialog>
    </article>
  );
}