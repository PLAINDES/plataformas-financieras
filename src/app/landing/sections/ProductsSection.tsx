// src/app/landing/sections/ProductsSection.tsx

import React, { useState, useEffect } from 'react';
import { EditableText } from '../../../components/editable/EditableText';
import { EditableCollection, AdminControls } from '../../../components/editable/EditableCollection';
import { useAuthContext } from '../../../hooks/useAuthContext';
import type { EditableContent, EditableCollectionData, CollectionItem } from '../../../types/editable.types';

// Tipo para productos editables
interface ProductItem extends CollectionItem {
  contentId: number; 
  name: string;
  caption: string;
  price: number;
  typeName: string;
  ribbon?: string | null;
  imageUrl?: string;
}

interface ProductsSectionProps {
  content: {
    kapital: EditableCollectionData<ProductItem>;
    valora: EditableCollectionData<ProductItem>;
  };
  onSave: (content: EditableContent) => Promise<void>;
  onSaveCollection: (data: EditableCollectionData<ProductItem>) => Promise<void>;

}



export function ProductsSection({ content, onSave, onSaveCollection }: ProductsSectionProps) {

  const { isAdmin } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'kapital' | 'valora'>('kapital');
  const [currentPage, setCurrentPage] = useState(0);

  // Estado editable
  const [titleData, setTitleData] = useState<EditableContent>({
    id: 'products-title',
    type: 'text',
    value: 'Productos',
    section: 'products',
  });

const [productosData, setProductosData] = useState<{
  kapital: EditableCollectionData<ProductItem>;
  valora: EditableCollectionData<ProductItem>;
}>(content);


  const customStyles = {
    gradientText: {
      background: '-webkit-linear-gradient(45deg, #181C32, #009ef7)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    gradientCard: {
      background: 'linear-gradient(135deg, rgba(179, 233, 255, 0.5) 0%, rgba(179, 233, 255, 0.5) 100%)',
    },
    navPillActive: {
      backgroundColor: '#009ef7',
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

  // Handlers
  const handleSaveTitle = async (content: EditableContent) => {
    console.log('Saving title:', content);
    setTitleData(content);
    // TODO: Backend call
  };

  const handleSaveProducts = async (data: EditableCollectionData<ProductItem>) => {
    console.log('Saving products:', data);
    setProductosData({
      ...productosData,
      [activeTab]: data,
    });
    // TODO: Backend call
  };

  const createNewProduct = (): ProductItem => ({
    id: `product_${Date.now()}`,
    order: productosData[activeTab].items.length,
    name: 'Nuevo Producto',
    caption: 'Descripción del producto',
    price: 0,
    typeName: 'Sistema',
  });

  return (
    <section id="productos" className="py-5 bg-light position-relative overflow-hidden">
      <div className="container py-lg-5 position-relative z-index-1">
        {/* Header */}
        <div className="text-start mb-1">
          <EditableText
            content={titleData}
            onSave={onSave}
            as="h2"
            className="display-16 mb-4 text-dark"
          />

          {/* Tabs */}
          <ul className="nav nav-pills justify-content-start gap-3" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link fw-bold px-3 py-2 shadow-sm ${
                  activeTab === 'kapital' ? 'active' : 'bg-white text-secondary'
                }`}
                onClick={() => setActiveTab('kapital')}
                style={activeTab === 'kapital' ? customStyles.navPillActive : {}}
              >
                Kapital
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold px-3 py-2 shadow-sm ${
                  activeTab === 'valora' ? 'active' : 'bg-white text-secondary'
                }`}
                onClick={() => setActiveTab('valora')}
                style={activeTab === 'valora' ? customStyles.navPillActive : {}}
              >
                Valora
              </button>
            </li>
          </ul>
        </div>

        {/* Content Area */}
        <div className="position-relative px-lg-5">
          {/* Grid de Productos con EditableCollection */}
          <EditableCollection
            data={productosData[activeTab]}
            onSave={onSaveCollection}
            createNewItem={createNewProduct}
            addButtonText="Agregar Producto"
            maxItems={20}
            allowReorder={true}
            className={`row g-4 ${isSingleCard ? 'justify-content-center' : 'justify-content-start'}`}
            renderItem={(product, index, helpers) => {
              // Solo mostrar productos visibles (paginación)
              const visibleIds = visibleProducts.map((p) => p.id);
              if (!visibleIds.includes(product.id) && !helpers.isEditing) {
                return null;
              }

              return (
                <div
                  key={product.id}
                  className={
                    isSingleCard ? 'col-10 col-md-6 col-lg-4' : 'col-12 col-md-6 col-lg-4'
                  }
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
                      customStyles={customStyles}
                      helpers={helpers}
                    />
                  )}
                </div>
              );
            }}
          />

          {/* Controles de Navegación */}
          {totalPages > 1 && (
            <>
              <button
                className="btn btn-white rounded-circle shadow position-absolute top-50 start-0 translate-middle-y ms-1 d-none d-lg-flex align-items-center justify-content-center"
                style={{ width: '45px', height: '45px', zIndex: 10 }}
                onClick={prevPage}
              >
                <i className="fa-solid fa-chevron-left text-primary"></i>
              </button>
              <button
                className="btn btn-white rounded-circle shadow position-absolute top-50 end-0 translate-middle-y me-1 d-none d-lg-flex align-items-center justify-content-center"
                style={{ width: '45px', height: '45px', zIndex: 10 }}
                onClick={nextPage}
              >
                <i className="fa-solid fa-chevron-right text-primary"></i>
              </button>

              {/* Indicadores Móviles */}
              <div className="d-flex justify-content-center gap-2 mt-4 d-lg-none">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    className={`btn btn-sm rounded-circle p-1 ${
                      idx === currentPage ? 'btn-primary' : 'btn-light'
                    }`}
                    style={{ width: '10px', height: '10px' }}
                    onClick={() => setCurrentPage(idx)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer Link */}
        <div className="text-center mt-5">
          <a href="#kt_body" className="btn btn-primary px-5 py-3 fw-bold rounded-pill shadow-sm">
            Ver catálogo completo <i className="fa-solid fa-arrow-right ms-2"></i>
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
  customStyles: any;
  helpers: any;
}

function ProductCard({ product, isSingleCard, customStyles, helpers }: ProductCardProps) {
  return (
    <div className="d-flex flex-column p-4 bs-card-2" style={{ position: 'relative' }}>
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
        className={`${
          isSingleCard ? 'mx-auto bs-card-image--single' : ''
        } rounded-3 d-flex align-items-center justify-content-center mb-4 text-white bs-card-image`}
        style={{
          ...customStyles.gradientCard,
          height: isSingleCard ? '120px' : '80px',
          width: isSingleCard ? '150px' : '',
        }}
      >
        <i className="fa-solid fa-laptop fa-xs fs-3"></i>
      </div>

      {/* Info */}
      <h3 className="h4 fw-bold mb-2 text-dark">{product.name}</h3>
      <p className="text-muted flex-grow-1">{product.caption}</p>

      {/* Footer Interno */}
      <div className="mt-4 pt-3 border-top d-flex flex-column gap-3">
        <button className="btn btn-outline-primary w-100">
          Adquirir {product.typeName} <i className="fa-solid fa-chevron-right ms-2 small"></i>
        </button>
        <div className="text-center">
          <span className="h4 fs-5 text-primary">
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
  customStyles: any;
}

function ProductEditor({ product, onSave, onCancel, customStyles }: ProductEditorProps) {
  const [formData, setFormData] = useState(product);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div
      className="d-flex flex-column p-4"
      style={{
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        backgroundColor: 'white',
        boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.1)',
        minHeight: '400px',
      }}
    >
      <h6 className="mb-3" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f59e0b' }}>
        ✏️ Editando Producto
      </h6>

      {/* Preview Icono */}
      <div
        className="rounded-3 d-flex align-items-center justify-content-center mb-3 text-white mx-auto"
        style={{
          ...customStyles.gradientCard,
          height: '80px',
          width: '80px',
        }}
      >
        <i className="fa-solid fa-laptop fa-xs fs-4"></i>
      </div>

      <div className="d-flex flex-column gap-3 flex-grow-1">
        {/* Nombre */}
        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
            Nombre
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
            Descripción
          </label>
          <textarea
            className="form-control form-control-sm"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            rows={2}
          />
        </div>

        {/* Precio */}
        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
            Precio (S/)
          </label>
          <input
            type="number"
            className="form-control form-control-sm"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            min="0"
            step="0.01"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
            Tipo
          </label>
          <select
            className="form-select form-select-sm"
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

      {/* Botones */}
      <div className="d-flex gap-2 mt-3">
        <button onClick={onCancel} className="btn btn-sm btn-secondary flex-fill">
          Cancelar
        </button>
        <button onClick={handleSubmit} className="btn btn-sm btn-primary flex-fill">
          Guardar
        </button>
      </div>
    </div>
  );
}