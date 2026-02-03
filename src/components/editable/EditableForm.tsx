// src/components/editable/EditableForm.tsx

import { useState } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea';
  placeholder: string;
  required: boolean;
  rows?: number;
}

interface ContactFormConfig {
  fields: FormField[];
  submitButtonText: string;
  successMessage: string;
}

interface EditableFormProps {
  config: ContactFormConfig;
  onSaveConfig: (config: ContactFormConfig) => Promise<void>;
  onSubmit: (e: React.FormEvent) => void;
  formData: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  mobileMode?: boolean;
}

export function EditableForm({
  config,
  onSaveConfig,
  onSubmit,
  formData,
  onChange,
  mobileMode = false,
}: EditableFormProps) {
  const { isAdmin } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedConfig, setEditedConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveConfig(editedConfig);
      setIsEditing(false);
      setEditingFieldId(null);
    } catch (error) {
      console.error('Error saving form config:', error);
      alert('Error al guardar. Intenta nuevamente.');
      setEditedConfig(config);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedConfig(config);
    setIsEditing(false);
    setEditingFieldId(null);
  };

  const handleFieldChange = (fieldId: string, key: string, value: any) => {
    setEditedConfig({
      ...editedConfig,
      fields: editedConfig.fields.map(field =>
        field.id === fieldId ? { ...field, [key]: value } : field
      )
    });
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      name: `field_${editedConfig.fields.length + 1}`,
      label: 'Nuevo Campo',
      type: 'text',
      placeholder: 'Ingrese información',
      required: false,
    };
    setEditedConfig({
      ...editedConfig,
      fields: [...editedConfig.fields, newField]
    });
    setEditingFieldId(newField.id);
  };

  const handleDeleteField = (fieldId: string) => {
    if (!confirm('¿Estás seguro de eliminar este campo?')) return;
    setEditedConfig({
      ...editedConfig,
      fields: editedConfig.fields.filter(field => field.id !== fieldId)
    });
  };

  const handleMoveFieldUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...editedConfig.fields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    setEditedConfig({ ...editedConfig, fields: newFields });
  };

  const handleMoveFieldDown = (index: number) => {
    if (index === editedConfig.fields.length - 1) return;
    const newFields = [...editedConfig.fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    setEditedConfig({ ...editedConfig, fields: newFields });
  };

  // Modo no-admin: renderizar formulario normal
  if (!isAdmin) {
    return (
      <div className={mobileMode ? 'h-100 d-flex flex-column' : 'card border-0 shadow-sm'}>
        <div className={mobileMode ? 'flex-grow-1 d-flex flex-column' : 'card-body p-4'}>
          <div className={mobileMode ? 'flex-grow-1 d-flex flex-column overflow-auto' : ''} style={mobileMode ? { minHeight: 0 } : {}}>
            {config.fields.map((field, index) => {
              const isLastTextarea = field.type === 'textarea' && index === config.fields.length - 1;
              return (
                <div 
                  key={field.id} 
                  className={`mb-2 ${isLastTextarea && mobileMode ? 'flex-grow-1 d-flex flex-column' : ''}`}
                >
                  <label className="form-label fw-semibold mb-1" style={{ fontSize: mobileMode ? '0.8rem' : '0.875rem' }}>
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea 
                      name={field.name}
                      className={`form-control ${mobileMode ? 'form-control-sm' : ''} ${isLastTextarea && mobileMode ? 'flex-grow-1' : ''}`}
                      rows={mobileMode ? undefined : field.rows || 4}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={onChange}
                      required={field.required}
                      style={mobileMode && isLastTextarea ? { minHeight: '80px', resize: 'none' } : {}}
                    ></textarea>
                  ) : (
                    <input 
                      type={field.type} 
                      name={field.name}
                      className={`form-control ${mobileMode ? 'form-control-sm' : ''}`}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={onChange}
                      required={field.required}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <button 
            type="button" 
            className={`btn btn-primary w-100 ${mobileMode ? 'btn-sm mt-2' : 'mt-3'}`}
            onClick={onSubmit}
            style={mobileMode ? { fontSize: '0.85rem', padding: '0.5rem' } : {}}
          >
            {config.submitButtonText}
          </button>
        </div>
      </div>
    );
  }

  // Modo admin - no editando: formulario con botón de editar
  if (!isEditing) {
    return (
      <div className={mobileMode ? 'h-100 d-flex flex-column position-relative' : 'card border-0 shadow-sm'} style={{ position: 'relative' }}>
        {/* Botón de editar configuración */}
        <div style={{ position: 'absolute', top: mobileMode ? '4px' : '12px', right: mobileMode ? '4px' : '12px', zIndex: 10 }}>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: mobileMode ? '4px 8px' : '6px 12px',
              border: 'none',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: mobileMode ? '0.65rem' : '0.75rem',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            title="Editar configuración del formulario"
          >
            ⚙️ {mobileMode ? 'Edit' : 'Editar Form'}
          </button>
        </div>

        <div className={mobileMode ? 'flex-grow-1 d-flex flex-column pt-4' : 'card-body p-4'}>
          <div className={mobileMode ? 'flex-grow-1 d-flex flex-column overflow-auto' : ''} style={mobileMode ? { minHeight: 0 } : {}}>
            {config.fields.map((field, index) => {
              const isLastTextarea = field.type === 'textarea' && index === config.fields.length - 1;
              return (
                <div 
                  key={field.id} 
                  className={`mb-2 ${isLastTextarea && mobileMode ? 'flex-grow-1 d-flex flex-column' : ''}`}
                >
                  <label className="form-label fw-semibold mb-1" style={{ fontSize: mobileMode ? '0.8rem' : '0.875rem' }}>
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea 
                      name={field.name}
                      className={`form-control ${mobileMode ? 'form-control-sm' : ''} ${isLastTextarea && mobileMode ? 'flex-grow-1' : ''}`}
                      rows={mobileMode ? undefined : field.rows || 4}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={onChange}
                      required={field.required}
                      style={mobileMode && isLastTextarea ? { minHeight: '80px', resize: 'none' } : {}}
                    ></textarea>
                  ) : (
                    <input 
                      type={field.type} 
                      name={field.name}
                      className={`form-control ${mobileMode ? 'form-control-sm' : ''}`}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={onChange}
                      required={field.required}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <button 
            type="button" 
            className={`btn btn-primary w-100 ${mobileMode ? 'btn-sm mt-2' : 'mt-3'}`}
            onClick={onSubmit}
            style={mobileMode ? { fontSize: '0.85rem', padding: '0.5rem' } : {}}
          >
            {config.submitButtonText}
          </button>
        </div>
      </div>
    );
  }

  // Modo admin - editando: panel de configuración
  return (
    <div 
      className={`card border-0 shadow-lg editable-form-config ${mobileMode ? 'h-100 d-flex flex-column' : ''}`} 
      style={{ border: '2px solid #3b82f6' }}
    >
      <div className="card-header bg-primary text-white" style={mobileMode ? { padding: '0.5rem' } : {}}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0" style={{ fontSize: mobileMode ? '0.8rem' : '1rem' }}>
            ⚙️ {mobileMode ? 'Config' : 'Config. Formulario'}
          </h5>
          <div className="d-flex gap-1">
            <button 
              onClick={handleCancel}
              disabled={isSaving}
              className="btn btn-sm btn-light"
              style={{ fontSize: mobileMode ? '0.7rem' : '0.8rem', padding: mobileMode ? '0.25rem 0.5rem' : '0.375rem 0.75rem' }}
            >
              {mobileMode ? 'X' : 'Cancelar'}
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-sm btn-success"
              style={{ fontSize: mobileMode ? '0.7rem' : '0.8rem', padding: mobileMode ? '0.25rem 0.5rem' : '0.375rem 0.75rem' }}
            >
              {isSaving ? '...' : (mobileMode ? '✓' : 'Guardar')}
            </button>
          </div>
        </div>
      </div>

      <div 
        className="card-body p-2 p-md-3 flex-grow-1" 
        style={{ 
          maxHeight: mobileMode ? '100%' : '70vh', 
          overflowY: 'auto',
          minHeight: 0
        }}
      >
        {/* Configuración de campos */}
        <div className="mb-3">
          <h6 className="fw-bold mb-2 small" style={{ fontSize: mobileMode ? '0.75rem' : '0.875rem' }}>
            Campos
          </h6>
          
          {editedConfig.fields.map((field, index) => (
            <div 
              key={field.id} 
              className="card mb-2"
              style={{ 
                border: editingFieldId === field.id ? '2px solid #ffc107' : '1px solid #dee2e6',
                backgroundColor: editingFieldId === field.id ? '#fffbf0' : 'white'
              }}
            >
              <div className="card-body p-2">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h6 className="mb-0 fw-bold" style={{ fontSize: mobileMode ? '0.7rem' : '0.8rem' }}>
                    {index + 1}. {field.label}
                  </h6>
                  <div className="d-flex gap-1 flex-shrink-0">
                    {index > 0 && (
                      <button
                        onClick={() => handleMoveFieldUp(index)}
                        className="btn btn-sm btn-outline-secondary"
                        style={{ padding: '1px 4px', fontSize: '0.6rem' }}
                      >
                        ↑
                      </button>
                    )}
                    {index < editedConfig.fields.length - 1 && (
                      <button
                        onClick={() => handleMoveFieldDown(index)}
                        className="btn btn-sm btn-outline-secondary"
                        style={{ padding: '1px 4px', fontSize: '0.6rem' }}
                      >
                        ↓
                      </button>
                    )}
                    <button
                      onClick={() => setEditingFieldId(editingFieldId === field.id ? null : field.id)}
                      className="btn btn-sm btn-outline-primary"
                      style={{ padding: '1px 5px', fontSize: '0.6rem' }}
                    >
                      {editingFieldId === field.id ? '✓' : '✏️'}
                    </button>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="btn btn-sm btn-outline-danger"
                      style={{ padding: '1px 5px', fontSize: '0.6rem' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {editingFieldId === field.id ? (
                  <div className="mt-2">
                    <div className="row g-1">
                      <div className="col-12">
                        <label className="form-label mb-1" style={{ fontSize: '0.7rem' }}>Etiqueta</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={field.label}
                          onChange={(e) => handleFieldChange(field.id, 'label', e.target.value)}
                          style={{ fontSize: '0.75rem' }}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label mb-1" style={{ fontSize: '0.7rem' }}>Nombre</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={field.name}
                          onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)}
                          style={{ fontSize: '0.75rem' }}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label mb-1" style={{ fontSize: '0.7rem' }}>Tipo</label>
                        <select
                          className="form-select form-select-sm"
                          value={field.type}
                          onChange={(e) => handleFieldChange(field.id, 'type', e.target.value)}
                          style={{ fontSize: '0.75rem' }}
                        >
                          <option value="text">Texto</option>
                          <option value="email">Email</option>
                          <option value="textarea">Área texto</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label mb-1" style={{ fontSize: '0.7rem' }}>Placeholder</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={field.placeholder}
                          onChange={(e) => handleFieldChange(field.id, 'placeholder', e.target.value)}
                          style={{ fontSize: '0.75rem' }}
                        />
                      </div>
                      {field.type === 'textarea' && (
                        <div className="col-6">
                          <label className="form-label mb-1" style={{ fontSize: '0.7rem' }}>Filas</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={field.rows || 4}
                            onChange={(e) => handleFieldChange(field.id, 'rows', parseInt(e.target.value))}
                            style={{ fontSize: '0.75rem' }}
                          />
                        </div>
                      )}
                      <div className="col-6">
                        <div className="form-check mt-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={field.required}
                            onChange={(e) => handleFieldChange(field.id, 'required', e.target.checked)}
                            style={{ fontSize: '0.7rem' }}
                          />
                          <label className="form-check-label" style={{ fontSize: '0.7rem' }}>
                            Obligatorio
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mb-0 text-muted" style={{ fontSize: '0.65rem' }}>
                    {field.type} • {field.required ? 'Obligatorio' : 'Opcional'}
                  </p>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={handleAddField}
            className="btn btn-sm btn-outline-primary w-100"
            style={{ border: '2px dashed #3b82f6', fontSize: mobileMode ? '0.7rem' : '0.75rem', padding: '0.25rem' }}
          >
            + Campo
          </button>
        </div>

        {/* Configuración del botón de envío */}
        <div className="mb-2">
          <label className="form-label fw-bold mb-1" style={{ fontSize: mobileMode ? '0.7rem' : '0.8rem' }}>
            Texto del Botón
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={editedConfig.submitButtonText}
            onChange={(e) => setEditedConfig({ ...editedConfig, submitButtonText: e.target.value })}
            style={{ fontSize: '0.75rem' }}
          />
        </div>

        {/* Mensaje de éxito */}
        <div className="mb-2">
          <label className="form-label fw-bold mb-1" style={{ fontSize: mobileMode ? '0.7rem' : '0.8rem' }}>
            Mensaje Éxito
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={editedConfig.successMessage}
            onChange={(e) => setEditedConfig({ ...editedConfig, successMessage: e.target.value })}
            style={{ fontSize: '0.75rem' }}
          />
        </div>

        {/* Preview - Solo en desktop o colapsable en mobile */}
        {!mobileMode && (
          <div className="mt-3">
            <details className="preview-details">
              <summary className="fw-bold mb-2 small" style={{ cursor: 'pointer', userSelect: 'none', fontSize: '0.75rem' }}>
                👁️ Vista Previa
              </summary>
              <div className="card bg-light mt-2">
                <div className="card-body p-2">
                  {editedConfig.fields.map((field) => (
                    <div key={field.id} className="mb-1">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.7rem' }}>
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea 
                          className="form-control form-control-sm" 
                          rows={2}
                          placeholder={field.placeholder}
                          disabled
                          style={{ fontSize: '0.7rem' }}
                        ></textarea>
                      ) : (
                        <input 
                          type={field.type}
                          className="form-control form-control-sm" 
                          placeholder={field.placeholder}
                          disabled
                          style={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </div>
                  ))}
                  <button className="btn btn-primary btn-sm w-100" disabled style={{ fontSize: '0.7rem' }}>
                    {editedConfig.submitButtonText}
                  </button>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Estilos para el componente */}
      <style>{`
        .editable-form-config {
          position: relative;
          z-index: 10;
        }

        .editable-form-config .card-body {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #f1f1f1;
        }

        .editable-form-config .card-body::-webkit-scrollbar {
          width: 4px;
        }

        .editable-form-config .card-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .editable-form-config .card-body::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }

        .preview-details summary {
          color: #3b82f6;
          padding: 0.25rem;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .preview-details[open] summary {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}