// src/app/landing/sections/ProductsSection.tsx

import React, { useState, useEffect } from 'react';
import { EditableText } from '../../../components/editable/EditableText';
import { EditableCollection, AdminControls } from '../../../components/editable/EditableCollection';
import { useAuthContext } from '../../../hooks/useAuthContext';
import type { EditableContent, EditableCollectionData, CollectionItem } from '../../../types/editable.types';

// Tipo para productos editables
interface ProductItem extends CollectionItem {
  name: string;
  caption: string;
  price: number;
  typeName: string;
  imageUrl?: string;
}

interface ProductsSectionProps {
  content: {
    title?: string;
    categories?: Array<{
      id: string;
      label: string;
      products: Array<{
        id: string;
        name: string;
        caption: string;
        price: number;
        typeName: string;
        ribbon?: string | null;
        imageUrl?: string;
      }>;
    }>;
  };
  onSave: (content: EditableContent) => Promise<void>;
  onSaveCollection: (data: EditableCollectionData<ProductItem>) => Promise<void>;
}

export function ProductsSection({ content, onSave, onSaveCollection }: ProductsSectionProps) {
  const { isAdmin } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'kapital' | 'valora'>('kapital');
  const [currentPage, setCurrentPage] = useState(0);

  // Adaptar los datos del content a la estructura interna
  const adaptContentToState = (rawContent: typeof content) => {
    if (!rawContent || !rawContent.categories) {
      return {
        kapital: {
          id: 'products-kapital',
          section: 'products',
          items: [],
        },
        valora: {
          id: 'products-valora',
          section: 'products',
          items: [],
        },
      };
    }

    const kapitalCategory = rawContent.categories.find(cat => cat.id === 'cat-kapital');
    const valoraCategory = rawContent.categories.find(cat => cat.id === 'cat-valora');

    return {
      kapital: {
        id: 'products-kapital',
        section: 'products',
        items: kapitalCategory?.products?.map((p, index) => ({
          ...p,
          order: index
        })) || [],
      },
      valora: {
        id: 'products-valora',
        section: 'products',
        items: valoraCategory?.products?.map((p, index) => ({
          ...p,
          order: index
        })) || [],
      },
    };
  };

  // Estado editable
  const [titleData, setTitleData] = useState<EditableContent>({
    id: 'title',
    type: 'text',
    value: content?.title || 'Productos',
    section: 'products',
  });

  const [productosData, setProductosData] = useState<{
    kapital: EditableCollectionData<ProductItem>;
    valora: EditableCollectionData<ProductItem>;
  }>(() => adaptContentToState(content));

  // Actualizar cuando cambie el content
  useEffect(() => {
    console.log('Content changed:', content);
    const newData = adaptContentToState(content);
    console.log('Adapted data:', newData);
    setProductosData(newData);
    setTitleData(prev => ({
      ...prev,
      value: content?.title || 'Productos'
    }));
  }, [content]);

  const customStyles = {
    gradientText: {
      background: '-webkit-linear-gradient(45deg, #181C32, #f70067)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    gradientCard: {
      background: 'linear-gradient(135deg, rgba(179, 233, 255, 0.5) 0%, rgba(179, 233, 255, 0.5) 100%)',
    },
    navPillActive: {
      backgroundColor: '#2FA4FF',
      color: 'white',
    },
  };

  const activeProducts = productosData[activeTab].items;

  // Paginación responsiva
  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 992) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  useEffect(() => {
    const handleResize = () => setItemsPerPage(getItemsPerPage());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab]);

  const totalPages = Math.ceil(activeProducts.length / itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  const getVisibleProducts = () => {
    const start = currentPage * itemsPerPage;
    return activeProducts.slice(start, start + itemsPerPage);
  };

  const visibleProducts = getVisibleProducts();
  const isSingleCard = visibleProducts.length === 1;

  const createNewProduct = (): ProductItem => ({
    id: `product_${Date.now()}`,
    order: productosData[activeTab].items.length,
    name: 'Nuevo Producto',
    caption: 'Descripción del producto',
    price: 0,
    typeName: 'Sistema',
  });

  return (
    <section id="productos" className="w-full bg-gray-50 overflow-hidden">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-16 lg:py-20 z-10">
        {/* Header */}
        <div className="text-left mb-8">
          <EditableText
            content={titleData}
            onSave={onSave}
            as="h2"
            className="mb-6 text-2xl lg:text-3xl"
          />

          {/* Tabs */}
          <ul className="flex flex-wrap list-none justify-start gap-3" role="tablist">
            {/* Tab: Kapital */}
            <li>
              <button
                onClick={() => setActiveTab('kapital')}
                className={`
                  px-5 py-2.5 rounded-md font-semibold text-sm transition-all duration-300 shadow-sm text-gray-500
                `}
                style={activeTab === 'kapital' ? customStyles.navPillActive : {}}
              >
                Kapital
              </button>
            </li>

            {/* Tab: Valora */}
            <li>
              <button
                onClick={() => setActiveTab('valora')}
                className={`
                  px-5 py-2.5 rounded-md font-semibold text-sm transition-all duration-300 shadow-sm text-gray-500
                `}
                style={activeTab === 'valora' ? customStyles.navPillActive : {}}
              >
                Valora
              </button>
            </li>
          </ul>
        </div>

        {/* Content Area con Navegación */}
        <div className="relative">
          {/* Botones de Navegación Desktop - Fuera del grid */}
          {totalPages > 1 && (
            <>
              {/* Botón Izquierdo */}
              <button
                className="
                  absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20
                  hidden lg:flex items-center justify-center
                  w-12 h-12 rounded-full
                  bg-white border-2 border-gray-200
                  text-gray-600 hover:text-blue-600
                  hover:border-blue-500 hover:shadow-lg
                  transition-all duration-300
                  disabled:opacity-40 disabled:cursor-not-allowed
                  group
                "
                onClick={prevPage}
                disabled={currentPage === 0}
              >
                <svg 
                  className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Botón Derecho */}
              <button
                className="
                  absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20
                  hidden lg:flex items-center justify-center
                  w-12 h-12 rounded-full
                  bg-white border-2 border-gray-200
                  text-gray-600 hover:text-blue-600
                  hover:border-blue-500 hover:shadow-lg
                  transition-all duration-300
                  disabled:opacity-40 disabled:cursor-not-allowed
                  group
                "
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
              >
                <svg 
                  className="w-5 h-5 transition-transform group-hover:translate-x-0.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Grid de Productos */}
          <EditableCollection
            data={productosData[activeTab]}
            onSave={onSaveCollection}
            createNewItem={createNewProduct}
            addButtonText="Agregar Producto"
            maxItems={20}
            allowReorder={true}
            className={`flex flex-wrap gap-y-8 ${isSingleCard ? 'justify-center' : 'justify-start'}`}
            renderItem={(product, index, helpers) => {
              const visibleIds = visibleProducts.map((p) => p.id);
              if (!visibleIds.includes(product.id) && !helpers.isEditing) {
                return null;
              }

              return (
                <div
                  key={product.id}
                  className={`px-4 ${
                    isSingleCard 
                      ? 'w-full sm:w-[83.33%] md:w-1/2 lg:w-1/3' 
                      : 'w-full md:w-1/2 lg:w-1/3'
                  }`}
                >
                  {helpers.isEditing ? (
                    <ProductEditor
                      product={product}
                      onSave={helpers.onSaveItem}
                      onCancel={helpers.onCancelEdit}
                      customStyles={customStyles}
                    />
                  ) : (
                    <ProductCard
                      product={product}
                      isSingleCard={isSingleCard}
                      helpers={helpers}
                      customStyles={customStyles}
                    />
                  )}
                </div>
              );
            }}
          />

          {/* Indicadores de Paginación (Dots) - Solo Móvil */}
          {totalPages > 1 && (
            <div className="flex lg:hidden justify-center items-center gap-2 mt-8">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  className={`
                    h-2 rounded-full transition-all duration-300
                    ${idx === currentPage 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-gray-300 w-2 hover:bg-gray-400'
                    }
                  `}
                  onClick={() => setCurrentPage(idx)}
                  aria-label={`Ir a página ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Link */}
        <div className="text-center mt-12">
          <a 
            href="#kt_body" 
            className="
              inline-flex items-center justify-center 
              px-8 py-3.5 
              bg-[#2FA4FF] text-white 
              font-bold rounded-full 
              shadow-lg shadow-blue-500/20 
              transition-all duration-300 
              hover:bg-blue-700 hover:shadow-blue-500/40 hover:-translate-y-1 
              group
            "
          >
            Ver catálogo completo 
            <svg 
              className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================
// PRODUCT CARD COMPONENT
// ============================================

interface ProductCardProps {
  product: ProductItem;
  isSingleCard: boolean;
  customStyles?: any;
  helpers: any;
}

function ProductCard({ product, isSingleCard, customStyles, helpers }: ProductCardProps) {
  return (
    <div className="flex flex-col p-8 bs-card-2 h-full" style={{ position: 'relative' }}>
      {/* Admin Controls */}
      {helpers.onEdit && (
        <AdminControls
          onEdit={helpers.onEdit}
          onDelete={helpers.onDelete}
          onMoveUp={helpers.onMoveUp}
          onMoveDown={helpers.onMoveDown}
          canMoveUp={helpers.canMoveUp}
          canMoveDown={helpers.canMoveDown}
          position="top-right"
        />
      )}

      {/* Imagen / Icono */}
      <div
        className={`
          flex items-center justify-center 
          mb-4 rounded-xl text-white
          transition-all duration-500 ease-in-out
          from-blue-500 to-indigo-600 shadow-inner
          bg-[#E0F7FA]
          ${isSingleCard 
            ? 'mx-auto h-[120px] w-[150px]' 
            : 'h-20 w-20' 
          }
        `}
      >
        <i className={`fa-solid fa-laptop text-sky-500 ${isSingleCard ? 'text-4xl' : 'text-2xl'}`}></i>
      </div>

      {/* Info */}
      <h3 className="text-xl font-bold mb-2 text-gray-900 leading-tight">
        {product.name}
      </h3>
      <p className="text-gray-500 flex-grow leading-relaxed mb-4">
        {product.caption}
      </p>

      {/* Footer Interno */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-4">
        {/* Botón Outline */}
        <button className="
          w-full py-2.5 px-4
          border-2 border-[#2FA4FF] text-[#2FA4FF] 
          font-semibold rounded-lg
          transition-all duration-200
          hover:bg-[#2FA4FF] hover:text-white
          active:scale-[0.98]
          flex items-center justify-center gap-2
          group
        ">
          Adquirir {product.typeName}
          <svg 
            className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Precio */}
        <div className="text-center">
          <span className="text-lg font-bold text-[#2FA4FF]">
            {product.price === 0 ? 'Gratis' : `S/ ${product.price}.00`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PRODUCT EDITOR
// ============================================

interface ProductEditorProps {
  product: ProductItem;
  onSave: (updates: Partial<ProductItem>) => Promise<void>;
  onCancel: () => void;
  customStyles?: any;
}

function ProductEditor({ product, onSave, onCancel, customStyles }: ProductEditorProps) {
  const [formData, setFormData] = useState(product);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div
      className="
        flex flex-col p-6 bg-white 
        border-2 border-[#2FA4FF] rounded-[12px] 
        ring-4 ring-[#2FA4FF]/10 
        min-h-[400px] shadow-sm
      "
    >
      <h6 className="mb-4 text-[14px] font-semibold text-[#2FA4FF] flex items-center gap-2">
        <span>✏️</span> Editando Producto
      </h6>

      {/* Preview Icono */}
      <div
        className="
          flex items-center justify-center mb-4 text-white mx-auto
          h-20 w-20 rounded-xl shadow-inner
          bg-gradient-to-br from-blue-500 to-indigo-600
        "
      >
        <i className="fa-solid fa-laptop text-2xl"></i>
      </div>

      <div className="flex flex-col gap-4 flex-grow">
        {/* Campo Nombre */}
        <div className="flex flex-col">
          <label className="text-[12px] font-medium text-gray-500 mb-1 ml-1">
            Nombre
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Campo Descripción */}
        <div className="flex flex-col">
          <label className="text-[12px] font-medium text-gray-500 mb-1 ml-1">
            Descripción
          </label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            rows={2}
          />
        </div>

        {/* Fila Doble: Precio y Tipo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-[12px] font-medium text-gray-500 mb-1 ml-1">
              Precio (S/)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[12px] font-medium text-gray-500 mb-1 ml-1">
              Tipo
            </label>
            <select
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
              value={formData.typeName}
              onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
            >
              <option value="Sistema">Sistema</option>
              <option value="Plataforma">Plataforma</option>
              <option value="Herramienta">Herramienta</option>
              <option value="Módulo">Módulo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-3 mt-6">
        <button 
          onClick={onCancel} 
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
        >
          Cancelar
        </button>
        <button 
          onClick={handleSubmit} 
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#2FA4FF] rounded-lg hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}