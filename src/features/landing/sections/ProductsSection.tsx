import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditableText } from '@/shared/components/editable/EditableText';
import { EditableCollection, AdminControls } from '@/shared/components/editable/EditableCollection';
import { useAuthContext } from '../../auth/hooks/useAuthContext';
import type { EditableContent, EditableCollectionData, CollectionItem } from '@/shared/types/editable.types';

interface ProductItem extends CollectionItem {
  name: string;
  caption: string;
  price: number;
  typeName: string;
  contact?: string;
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
        typeName?: string;
        contact?: string;
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

  const adaptContentToState = (rawContent: typeof content) => {
    if (!rawContent || !rawContent.categories) {
      return {
        kapital: { id: 'products-kapital', section: 'products', items: [] },
        valora: { id: 'products-valora', section: 'products', items: [] },
      };
    }
    const kapitalCategory = rawContent.categories.find(cat => cat.id === 'cat-kapital');
    const valoraCategory = rawContent.categories.find(cat => cat.id === 'cat-valora');
    return {
      kapital: {
        id: 'products-kapital',
        section: 'products',
        items: kapitalCategory?.products?.map((p, index) => ({ ...p, order: index })) || [],
      },
      valora: {
        id: 'products-valora',
        section: 'products',
        items: valoraCategory?.products?.map((p, index) => ({ ...p, order: index })) || [],
      },
    };
  };

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

  useEffect(() => {
    setProductosData(adaptContentToState(content));
    setTitleData(prev => ({ ...prev, value: content?.title || 'Productos' }));
  }, [content]);

  const customStyles = {
    gradientText: {
      background: '-webkit-linear-gradient(45deg, #181C32, #f70067)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    navPillActive: {
      backgroundColor: '#2FA4FF',
      color: 'white',
    },
  };

  const activeProducts = productosData[activeTab].items;

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

  useEffect(() => { setCurrentPage(0); }, [activeTab]);

  const totalPages = Math.ceil(activeProducts.length / itemsPerPage);
  const nextPage = () => setCurrentPage(prev => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);

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
        <div className="text-left mb-8">
          <EditableText
            content={titleData}
            onSave={onSave}
            as="h2"
            className="mb-6 text-2xl lg:text-3xl"
          />

          <ul className="flex flex-wrap list-none justify-start gap-3" role="tablist">
            {(['kapital', 'valora'] as const).map(tab => (
              <li key={tab}>
                <Button
                  onClick={() => setActiveTab(tab)}
                  variant="ghost"
                  className="px-5 py-2.5 rounded-md font-semibold text-sm shadow-sm text-gray-500 capitalize"
                  style={activeTab === tab ? customStyles.navPillActive : {}}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          {totalPages > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 hidden lg:flex w-12 h-12 rounded-full border-2 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-500 hover:shadow-lg group"
                onClick={prevPage}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" strokeWidth={2.5} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 hidden lg:flex w-12 h-12 rounded-full border-2 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-500 hover:shadow-lg group"
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </Button>
            </>
          )}

          <EditableCollection
            data={productosData[activeTab]}
            onSave={onSaveCollection}
            createNewItem={createNewProduct}
            addButtonText="Agregar Producto"
            maxItems={20}
            allowReorder={true}
            className={`flex flex-wrap gap-y-8 ${isSingleCard ? 'justify-center' : 'justify-start'}`}
            renderItem={(product, index, helpers) => {
              const visibleIds = visibleProducts.map(p => p.id);
              if (!visibleIds.includes(product.id) && !helpers.isEditing) return null;
              return (
                <div
                  key={product.id}
                  className={`px-4 ${isSingleCard ? 'w-full sm:w-[83.33%] md:w-1/2 lg:w-1/3' : 'w-full md:w-1/2 lg:w-1/3'}`}
                >
                  {helpers.isEditing ? (
                    <ProductEditor
                      product={product}
                      onSave={helpers.onSaveItem}
                      onCancel={helpers.onCancelEdit}
                    />
                  ) : (
                    <ProductCard
                      product={product}
                      isSingleCard={isSingleCard}
                      helpers={helpers}
                    />
                  )}
                </div>
              );
            }}
          />

          {totalPages > 1 && (
            <div className="flex lg:hidden justify-center items-center gap-2 mt-8">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentPage ? 'bg-blue-600 w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'}`}
                  onClick={() => setCurrentPage(idx)}
                  aria-label={`Ir a página ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <a
            href="#kt_body"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#2FA4FF] text-white font-bold rounded-full shadow-lg shadow-blue-500/20 transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-500/40 hover:-translate-y-1 group"
          >
            Ver catálogo completo
            <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </section>
  );
}

interface ProductCardProps {
  product: ProductItem;
  isSingleCard: boolean;
  helpers: any;
}

function ProductCard({ product, isSingleCard, helpers }: ProductCardProps) {
  return (
    <div className="flex flex-col p-8 bs-card-2 h-full relative">
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

      <div className={`flex items-center justify-center mb-4 rounded-xl bg-[#E0F7FA] ${isSingleCard ? 'mx-auto h-[120px] w-[150px]' : 'h-20 w-20'}`}>
        <Laptop className={`text-sky-500 ${isSingleCard ? 'w-10 h-10' : 'w-6 h-6'}`} />
      </div>

      <h3 className="text-xl font-bold mb-2 text-gray-900 leading-tight">{product.name}</h3>
      <p className="text-gray-500 flex-grow leading-relaxed mb-4">{product.caption}</p>

      <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-4">
        <Button
          variant="outline"
          onClick={() => {
            if (product.contact) {
              const message = encodeURIComponent(`Hola, estoy interesado en adquirir el ${product.typeName || 'producto'}: ${product.name}`);
              window.open(`https://wa.me/${product.contact}?text=${message}`, '_blank');
            } else if ((product as any).url) {
              window.open((product as any).url, '_blank');
            }
          }}
          className="w-full py-2.5 px-4 border-2 border-[#2FA4FF] text-[#2FA4FF] font-semibold rounded-lg hover:bg-[#2FA4FF] hover:text-white group h-auto"
        >
          Adquirir {product.typeName || ''}
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
        </Button>

        <div className="text-center">
          <span className="text-lg font-bold text-[#2FA4FF]">
            {product.price === 0 ? 'Gratis' : `S/ ${product.price}.00`}
          </span>
        </div>
      </div>
    </div>
  );
}

interface ProductEditorProps {
  product: ProductItem;
  onSave: (updates: Partial<ProductItem>) => Promise<void>;
  onCancel: () => void;
}

function ProductEditor({ product, onSave, onCancel }: ProductEditorProps) {
  const [formData, setFormData] = useState({
    ...product,
    typeName: product.typeName || '',
    contact: product.contact || '',
    url: (product as any).url || '',
  });

  return (
    <div className="flex flex-col p-6 bg-white border-2 border-[#2FA4FF] rounded-[12px] ring-4 ring-[#2FA4FF]/10 min-h-[400px] shadow-sm">
      <h6 className="mb-4 text-[14px] font-semibold text-[#2FA4FF] flex items-center gap-2">
        <span>✏️</span> Editando Producto
      </h6>

      <div className="flex items-center justify-center mb-4 mx-auto h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
        <Laptop className="w-6 h-6 text-white" />
      </div>

      <div className="flex flex-col gap-4 flex-grow">
        {[
          { label: 'Nombre', field: 'name', type: 'text' },
        ].map(({ label, field, type }) => (
          <div key={field} className="flex flex-col">
            <label className="text-[12px] font-medium text-gray-500 mb-1 ml-1">{label}</label>
            <input
              type={type}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={(formData as any)[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            />
          </div>
        ))}

        <div className="flex flex-col">
          <label className="text-[12px] font-medium text-gray-500 mb-1 ml-1">Descripción</label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-[12px] font-medium text-gray-500 mb-1 ml-1">Precio (S/)</label>
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
            <label className="text-[12px] font-medium text-gray-500 mb-1 ml-1">Tipo (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Sistema, App..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
              value={formData.typeName}
              onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-[12px] font-medium text-gray-500 mb-1 ml-1 flex justify-between">URL <span>(Opcional)</span></label>
          <input
            type="url"
            placeholder="https://ejemplo.com"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100"
            value={formData.url}
            disabled={!!formData.contact}
            onChange={(e) => setFormData({ ...formData, url: e.target.value, contact: e.target.value ? '' : formData.contact })}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[12px] font-medium text-gray-500 mb-1 ml-1 flex justify-between">WhatsApp de Contacto <span>(Opcional)</span></label>
          <input
            type="tel"
            placeholder="Ej: 51999888777"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:bg-gray-100"
            value={formData.contact}
            disabled={!!formData.url}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value, url: e.target.value ? '' : formData.url })}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" className="flex-1 text-sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button className="flex-1 text-sm bg-[#2FA4FF] hover:bg-blue-600 shadow-md shadow-blue-500/20" onClick={() => onSave(formData)}>
          Guardar
        </Button>
      </div>
    </div>
  );
}