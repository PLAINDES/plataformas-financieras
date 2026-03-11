// src/components/editable/EditableForm.tsx

import { useState } from "react";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";

interface FormField {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "textarea";
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
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
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
      console.error("Error saving form config:", error);
      alert("Error al guardar. Intenta nuevamente.");
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
      fields: editedConfig.fields.map((field) =>
        field.id === fieldId ? { ...field, [key]: value } : field
      ),
    });
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      name: `field_${editedConfig.fields.length + 1}`,
      label: "Nuevo Campo",
      type: "text",
      placeholder: "Ingrese información",
      required: false,
    };
    setEditedConfig({
      ...editedConfig,
      fields: [...editedConfig.fields, newField],
    });
    setEditingFieldId(newField.id);
  };

  const handleDeleteField = (fieldId: string) => {
    if (!confirm("¿Estás seguro de eliminar este campo?")) return;
    setEditedConfig({
      ...editedConfig,
      fields: editedConfig.fields.filter((field) => field.id !== fieldId),
    });
  };

  const handleCancelEdit = (_fieldId: string) => {
    setEditingFieldId(null);
  };

  const handleMoveFieldUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...editedConfig.fields];
    [newFields[index - 1], newFields[index]] = [
      newFields[index],
      newFields[index - 1],
    ];
    setEditedConfig({ ...editedConfig, fields: newFields });
  };

  const handleMoveFieldDown = (index: number) => {
    if (index === editedConfig.fields.length - 1) return;
    const newFields = [...editedConfig.fields];
    [newFields[index], newFields[index + 1]] = [
      newFields[index + 1],
      newFields[index],
    ];
    setEditedConfig({ ...editedConfig, fields: newFields });
  };

  const buttonBaseClass =
    "px-1 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors flex items-center justify-center";

  // Modo no-admin: renderizar formulario normal
  if (!isAdmin) {
    return (
      <div
        className={
          mobileMode
            ? "h-full flex flex-col"
            : "bg-white border-0 rounded-lg shadow-sm"
        }
      >
        <div className={mobileMode ? "grow flex flex-col" : "p-8"}>
          <div
            className={mobileMode ? "grow flex flex-col overflow-auto" : ""}
            style={mobileMode ? { minHeight: 0 } : {}}
          >
            {config.fields.map((field, index) => {
              const isLastTextarea =
                field.type === "textarea" && index === config.fields.length - 1;
              return (
                <div
                  key={field.id}
                  className={`mb-4 ${isLastTextarea && mobileMode ? "grow flex flex-col" : ""}`}
                >
                  <label
                    className="block mb-2 font-semibold text-(--bs-dark)"
                    style={{ fontSize: mobileMode ? "0.8rem" : "0.875rem" }}
                  >
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--bs-primary) focus:border-transparent transition-all ${isLastTextarea && mobileMode ? "grow" : ""}`}
                      rows={mobileMode ? undefined : field.rows || 4}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={onChange}
                      required={field.required}
                      style={
                        mobileMode && isLastTextarea
                          ? {
                              minHeight: "80px",
                              resize: "none",
                              fontSize: "0.875rem",
                              padding: "0.75rem",
                            }
                          : { fontSize: "0.9375rem" }
                      }
                    ></textarea>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--bs-primary) focus:border-transparent transition-all"
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={onChange}
                      required={field.required}
                      style={
                        mobileMode
                          ? { fontSize: "0.875rem", padding: "0.75rem 1rem" }
                          : { fontSize: "0.9375rem" }
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className={`w-full bg-(--bs-primary) text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity ${mobileMode ? "mt-2" : "mt-6"}`}
            onClick={onSubmit}
            style={
              mobileMode
                ? { fontSize: "0.85rem", padding: "0.625rem" }
                : { fontSize: "1rem" }
            }
          >
            {config.submitButtonText}
          </button>
        </div>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div
        className={
          mobileMode
            ? "h-full flex flex-col relative"
            : "bg-white border-0 rounded-lg shadow-sm"
        }
        style={{ position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            top: mobileMode ? "4px" : "12px",
            right: mobileMode ? "4px" : "12px",
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: mobileMode ? "4px 8px" : "6px 12px",
              border: "none",
              background: "#3b82f6",
              color: "white",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: mobileMode ? "0.65rem" : "0.75rem",
              fontWeight: "500",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            title="Editar configuración del formulario"
          >
            ⚙️ {mobileMode ? "Edit" : "Editar Form"}
          </button>
        </div>

        <div className={mobileMode ? "grow flex flex-col pt-8" : "p-8"}>
          <div
            className={mobileMode ? "grow flex flex-col overflow-auto" : ""}
            style={mobileMode ? { minHeight: 0 } : {}}
          >
            {config.fields.map((field, index) => {
              const isLastTextarea =
                field.type === "textarea" && index === config.fields.length - 1;
              return (
                <div
                  key={field.id}
                  className={`mb-4 ${isLastTextarea && mobileMode ? "grow flex flex-col" : ""}`}
                >
                  <label
                    className="block mb-2 font-semibold text-(--bs-dark)"
                    style={{ fontSize: mobileMode ? "0.8rem" : "0.875rem" }}
                  >
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--bs-primary) focus:border-transparent transition-all ${isLastTextarea && mobileMode ? "grow" : ""}`}
                      rows={mobileMode ? undefined : field.rows || 4}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={onChange}
                      required={field.required}
                      style={
                        mobileMode && isLastTextarea
                          ? {
                              minHeight: "80px",
                              resize: "none",
                              fontSize: "0.875rem",
                              padding: "0.75rem",
                            }
                          : { fontSize: "0.9375rem" }
                      }
                    ></textarea>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--bs-primary) focus:border-transparent transition-all"
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={onChange}
                      required={field.required}
                      style={
                        mobileMode
                          ? { fontSize: "0.875rem", padding: "0.75rem 1rem" }
                          : { fontSize: "0.9375rem" }
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className={`w-full bg-(--bs-primary) text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity ${mobileMode ? "mt-2" : "mt-6"}`}
            onClick={onSubmit}
            style={
              mobileMode
                ? { fontSize: "0.85rem", padding: "0.625rem" }
                : { fontSize: "1rem" }
            }
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
      className={`bg-white border-0 rounded-lg shadow-lg editable-form-config ${mobileMode ? "h-full flex flex-col" : ""}`}
      style={{ border: "2px solid #2FA4FF" }}
    >
      <div
        className="bg-[#2FA4FF] text-white rounded-t-lg"
        style={mobileMode ? { padding: "0.5rem" } : { padding: "1rem" }}
      >
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h5
            className="mb-0 font-semibold"
            style={{ fontSize: mobileMode ? "0.8rem" : "1rem" }}
          >
            ⚙️ {mobileMode ? "Config" : "Config. Formulario"}
          </h5>
          <div className="flex gap-1">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm bg-white text-(--bs-dark) rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
              style={{
                fontSize: mobileMode ? "0.7rem" : "0.8rem",
                padding: mobileMode ? "0.25rem 0.5rem" : "0.375rem 0.75rem",
              }}
            >
              {mobileMode ? "X" : "Cancelar"}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm bg-[#0E185F] text-white rounded-md hover:bg-[#1B6B93] transition-colors disabled:opacity-50"
              style={{
                fontSize: mobileMode ? "0.7rem" : "0.8rem",
                padding: mobileMode ? "0.25rem 0.5rem" : "0.375rem 0.75rem",
              }}
            >
              {isSaving ? "..." : mobileMode ? "✓" : "Guardar"}
            </button>
          </div>
        </div>
      </div>

      <div
        className="p-2 md:p-3 grow overflow-y-auto"
        style={{
          maxHeight: mobileMode ? "100%" : "70vh",
          minHeight: 0,
        }}
      >
        {/* Configuración de campos */}
        <div className="mb-3">
          <h6
            className="font-bold mb-2 text-sm"
            style={{ fontSize: mobileMode ? "0.75rem" : "0.875rem" }}
          >
            Campos
          </h6>

          {editedConfig.fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-white rounded-lg mb-2"
              style={{
                border:
                  editingFieldId === field.id
                    ? "2px solid #ffc107"
                    : "1px solid #dee2e6",
                backgroundColor:
                  editingFieldId === field.id ? "#fffbf0" : "white",
              }}
            >
              <div className="p-2">
                <div className="flex justify-between items-start mb-1">
                  <h6
                    className="mb-0 font-bold"
                    style={{ fontSize: mobileMode ? "0.7rem" : "0.8rem" }}
                  >
                    {index + 1}. {field.label}
                  </h6>
                  <div className="flex gap-1 shrink-0">
                    {/* Subir */}
                    {index > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveFieldUp(index);
                        }}
                        className={buttonBaseClass}
                        title="Subir"
                      >
                        <span className="text-xs font-bold">↑</span>
                      </button>
                    )}

                    {/* Bajar */}
                    {index < editedConfig.fields.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveFieldDown(index);
                        }}
                        className={buttonBaseClass}
                        title="Bajar"
                      >
                        <span className="text-xs font-bold">↓</span>
                      </button>
                    )}

                    {/* Editar / Guardar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFieldId(
                          editingFieldId === field.id ? null : field.id
                        );
                      }}
                      className={`${buttonBaseClass} hover:text-blue-600 hover:border-blue-400`}
                      title={editingFieldId === field.id ? "Guardar" : "Editar"}
                    >
                      {editingFieldId === field.id ? (
                        /* CHECK */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        /* LÁPIZ */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      )}
                    </button>

                    {/* Cancelar */}
                    {editingFieldId === field.id ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit(field.id);
                          }}
                          className={`${buttonBaseClass} hover:text-red-600 hover:border-red-400`}
                          title="Cancelar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            className="lucide lucide-x-icon lucide-x"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Eliminar */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteField(field.id);
                          }}
                          className={`${buttonBaseClass} hover:text-red-600 hover:border-red-400`}
                          title="Eliminar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingFieldId === field.id ? (
                  <div className="mt-2">
                    <div className="flex flex-wrap -mx-0.5">
                      <div className="w-full px-0.5 mb-2">
                        <label
                          className="block mb-1 text-(--bs-dark) font-medium"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Etiqueta
                        </label>
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-(--bs-primary) focus:border-transparent"
                          value={field.label}
                          onChange={(e) =>
                            handleFieldChange(field.id, "label", e.target.value)
                          }
                          style={{ fontSize: "0.75rem" }}
                        />
                      </div>
                      <div className="w-full px-0.5 mb-2">
                        <label
                          className="block mb-1 text-(--bs-dark) font-medium"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Nombre
                        </label>
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-(--bs-primary) focus:border-transparent"
                          value={field.name}
                          onChange={(e) =>
                            handleFieldChange(field.id, "name", e.target.value)
                          }
                          style={{ fontSize: "0.75rem" }}
                        />
                      </div>
                      <div className="w-1/2 px-0.5 mb-2">
                        <label
                          className="block mb-1 text-(--bs-dark) font-medium"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Tipo
                        </label>
                        <select
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-(--bs-primary) focus:border-transparent"
                          value={field.type}
                          onChange={(e) =>
                            handleFieldChange(field.id, "type", e.target.value)
                          }
                          style={{ fontSize: "0.75rem" }}
                        >
                          <option value="text">Texto</option>
                          <option value="email">Email</option>
                          <option value="textarea">Área texto</option>
                        </select>
                      </div>
                      <div className="w-1/2 px-0.5 mb-2">
                        <label
                          className="block mb-1 text-(--bs-dark) font-medium"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Placeholder
                        </label>
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-(--bs-primary) focus:border-transparent"
                          value={field.placeholder}
                          onChange={(e) =>
                            handleFieldChange(
                              field.id,
                              "placeholder",
                              e.target.value
                            )
                          }
                          style={{ fontSize: "0.75rem" }}
                        />
                      </div>
                      {field.type === "textarea" && (
                        <div className="w-1/2 px-0.5 mb-2">
                          <label
                            className="block mb-1 text-(--bs-dark) font-medium"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Filas
                          </label>
                          <input
                            type="number"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-(--bs-primary) focus:border-transparent"
                            value={field.rows || 4}
                            onChange={(e) =>
                              handleFieldChange(
                                field.id,
                                "rows",
                                parseInt(e.target.value)
                              )
                            }
                            style={{ fontSize: "0.75rem" }}
                          />
                        </div>
                      )}
                      <div className="w-1/2 px-0.5 mb-2">
                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-(--bs-primary) border-gray-300 rounded focus:ring-(--bs-primary)"
                            checked={field.required}
                            onChange={(e) =>
                              handleFieldChange(
                                field.id,
                                "required",
                                e.target.checked
                              )
                            }
                          />
                          <label
                            className="ml-2 text-(--bs-dark)"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Obligatorio
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p
                    className="mb-0 text-gray-500"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {field.type} • {field.required ? "Obligatorio" : "Opcional"}
                  </p>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={handleAddField}
            className="w-full px-3 py-2 text-sm border-2 border-dashed border-(--bs-primary) text-(--bs-primary) rounded-md hover:bg-blue-50 transition-colors"
            style={{
              fontSize: mobileMode ? "0.7rem" : "0.75rem",
              padding: "0.5rem",
            }}
          >
            + Campo
          </button>
        </div>

        {/* Configuración del botón de envío */}
        <div className="mb-2">
          <label
            className="block mb-1 font-bold text-(--bs-dark)"
            style={{ fontSize: mobileMode ? "0.7rem" : "0.8rem" }}
          >
            Texto del Botón
          </label>
          <input
            type="text"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-(--bs-primary) focus:border-transparent"
            value={editedConfig.submitButtonText}
            onChange={(e) =>
              setEditedConfig({
                ...editedConfig,
                submitButtonText: e.target.value,
              })
            }
            style={{ fontSize: "0.75rem" }}
          />
        </div>

        {/* Mensaje de éxito */}
        <div className="mb-2">
          <label
            className="block mb-1 font-bold text-(--bs-dark)"
            style={{ fontSize: mobileMode ? "0.7rem" : "0.8rem" }}
          >
            Mensaje Éxito
          </label>
          <input
            type="text"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-(--bs-primary) focus:border-transparent"
            value={editedConfig.successMessage}
            onChange={(e) =>
              setEditedConfig({
                ...editedConfig,
                successMessage: e.target.value,
              })
            }
            style={{ fontSize: "0.75rem" }}
          />
        </div>

        {/* Preview - Solo en desktop o colapsable en mobile */}
        {!mobileMode && (
          <div className="mt-3">
            <details className="preview-details">
              <summary
                className="font-bold mb-2 text-sm cursor-pointer select-none"
                style={{ fontSize: "0.75rem" }}
              >
                👁️ Vista Previa
              </summary>
              <div className="bg-gray-100 rounded-lg mt-2">
                <div className="p-2">
                  {editedConfig.fields.map((field) => (
                    <div key={field.id} className="mb-1">
                      <label
                        className="block font-semibold text-(--bs-dark)"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md opacity-60"
                          rows={2}
                          placeholder={field.placeholder}
                          disabled
                          style={{ fontSize: "0.7rem" }}
                        ></textarea>
                      ) : (
                        <input
                          type={field.type}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md opacity-60"
                          placeholder={field.placeholder}
                          disabled
                          style={{ fontSize: "0.7rem" }}
                        />
                      )}
                    </div>
                  ))}
                  <button
                    className="w-full px-3 py-1.5 text-sm bg-(--bs-primary) text-white rounded-md opacity-60"
                    disabled
                    style={{ fontSize: "0.7rem" }}
                  >
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

        .editable-form-config > div:last-of-type {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #f1f1f1;
        }

        .editable-form-config > div:last-of-type::-webkit-scrollbar {
          width: 4px;
        }

        .editable-form-config > div:last-of-type::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .editable-form-config > div:last-of-type::-webkit-scrollbar-thumb {
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
