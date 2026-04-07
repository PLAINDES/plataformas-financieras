import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainService } from "@/shared/services/main.service";
import { LoadingOverlay } from "@/shared/components/common/LoadingOverlay";
import DevPlaceholder from "@/shared/components/DevPlaceholder";
import { Home } from "lucide-react";
import Breadcrumbs from "@/shared/components/Breadcrumbs";

const PortadaEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const coverId = id ? parseInt(id, 10) : null;

  const [isSaving, setIsSaving] = useState(false);

  const [showTextReport, setShowTextReport] = useState(true);
  const [typeId, setTypeId] = useState<number>(1); // 1 = Imagen Adjuntada, 2 = Personalizada
  const [name, setName] = useState("");

  const [footerOne, setFooterOne] = useState<File | null>(null);
  const [footerTwo, setFooterTwo] = useState<File | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);

  const [imageTop, setImageTop] = useState<File | null>(null);
  const [imageCenter, setImageCenter] = useState<File | null>(null);
  const [imageBottom, setImageBottom] = useState<File | null>(null);
  const [imageBackground, setImageBackground] = useState<File | null>(null);

  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(
    null
  );
  const [centerPreview, setCenterPreview] = useState<string | null>(null);

  // existing remote URLs
  const [existingPortadaUrl, setExistingPortadaUrl] = useState<string | null>(
    null
  );
  const [existingFooterOneUrl, setExistingFooterOneUrl] = useState<
    string | null
  >(null);
  const [existingFooterTwoUrl, setExistingFooterTwoUrl] = useState<
    string | null
  >(null);
  const [existingImageTopUrl, setExistingImageTopUrl] = useState<string | null>(
    null
  );
  const [existingImageCenterUrl, setExistingImageCenterUrl] = useState<
    string | null
  >(null);
  const [existingImageBottomUrl, setExistingImageBottomUrl] = useState<
    string | null
  >(null);
  const [existingImageBackgroundUrl, setExistingImageBackgroundUrl] = useState<
    string | null
  >(null);

  const breadcrumbItems = [
    {
      label: (
        <div className="flex items-center gap-1">
          <Home className="h-3 w-3" />
          <span className="ml-1">Home</span>
        </div>
      ),
    },
    { label: "Portadas", onClick: () => navigate("/admin/portadas") },
    { label: "Editar portada" },
  ];

  useEffect(() => {
    if (imageBackground) {
      setBackgroundPreview(URL.createObjectURL(imageBackground));
    }
    return () => {
      if (backgroundPreview) URL.revokeObjectURL(backgroundPreview);
    };
  }, [imageBackground]);

  useEffect(() => {
    if (imageCenter) {
      setCenterPreview(URL.createObjectURL(imageCenter));
    }
    return () => {
      if (centerPreview) URL.revokeObjectURL(centerPreview);
    };
  }, [imageCenter]);

  useEffect(() => {
    if (!coverId) return;
    (async () => {
      try {
        const c = await MainService.getCover(coverId);
        setName(c.nombre ?? "");
        setTypeId(c.tipo === "imagen_adjuntada" ? 1 : 2);

        // set existing image urls for previews
        setExistingPortadaUrl(c.portada?.url ?? null);
        setExistingFooterOneUrl(c.primer_imagen_footer?.url ?? null);
        setExistingFooterTwoUrl(c.segundo_imagen_footer?.url ?? null);
        setExistingImageTopUrl(c.logo_superior?.url ?? null);
        setExistingImageCenterUrl(c.imagen_central?.url ?? null);
        setExistingImageBottomUrl(c.logo_inferior?.url ?? null);
        setExistingImageBackgroundUrl(c.imagen_fondo?.url ?? null);
      } catch (err) {
        console.error(err);
        alert("Error cargando la portada");
      }
    })();
  }, [coverId]);

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void
  ) => {
    const f = e.target.files && e.target.files[0];
    setter(f ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverId) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("nombre", name);
      formData.append(
        "tipo",
        typeId === 1 ? "imagen_adjuntada" : "personalizada"
      );

      if (footerOne) formData.append("primer_imagen_footer", footerOne);
      if (footerTwo) formData.append("segundo_imagen_footer", footerTwo);

      if (typeId === 1) {
        if (attachment) formData.append("portada", attachment);
      } else {
        if (imageTop) formData.append("logo_superior", imageTop);
        if (imageCenter) formData.append("imagen_central", imageCenter);
        if (imageBottom) formData.append("logo_inferior", imageBottom);
        if (imageBackground) formData.append("imagen_fondo", imageBackground);
      }

      await MainService.updateCover(coverId, formData);
      navigate("/admin/portadas");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar portada");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {isSaving && <LoadingOverlay message="Guardando..." />}
      <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6 ">
        <h1 className="text-xs font-bold tracking-widest text-slate-800 uppercase">
          Editar portada
        </h1>
      </header>
      <Breadcrumbs
        items={breadcrumbItems}
        className="flex items-center gap-1 py-4 text-[10px] text-slate-500 md:px-6"
      />
      <div className="p-6 pt-0">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Portada</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                form="formCover"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/portadas")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Regresar
              </button>
            </div>
          </div>

          <div className="p-6">
            <form id="formCover" onSubmit={handleSubmit} className="space-y-6">
              <input type="hidden" name="cover_id" value={coverId ?? ""} />

              <div className="grid grid-cols-12 gap-4 items-start">
                <label className="col-span-12 sm:col-span-3 text-sm font-medium text-gray-700 pt-2">
                  Acciones
                </label>
                <div className="col-span-12 sm:col-span-9">
                  <label className="inline-flex items-center mt-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 transition-colors"
                      name="show_text_report"
                      checked={showTextReport}
                      onChange={(e) => setShowTextReport(e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      Mostrar Texto del reporte
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 items-start border-t border-gray-100 pt-6">
                <label className="col-span-12 sm:col-span-3 text-sm font-medium text-gray-700 pt-2">
                  Tipo de Portada
                </label>
                <div className="col-span-12 sm:col-span-9 flex items-center gap-6 mt-2">
                  <label className="inline-flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 transition-colors"
                      name="type_id"
                      value={1}
                      checked={typeId === 1}
                      onChange={() => setTypeId(1)}
                    />
                    <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      Imagen Adjuntada
                    </span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 transition-colors"
                      name="type_id"
                      value={2}
                      checked={typeId === 2}
                      onChange={() => setTypeId(2)}
                    />
                    <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      Personalizada
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 items-center border-t border-gray-100 pt-6">
                <label className="col-span-12 sm:col-span-3 text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <div className="col-span-12 sm:col-span-9">
                  <input
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                    placeholder="Ej. Portada Trimestral"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 items-center border-t border-gray-100 pt-6">
                <label className="col-span-12 sm:col-span-3 text-sm font-medium text-gray-700">
                  Primer Imagen Footer
                </label>
                <div className="col-span-12 sm:col-span-9">
                  <input
                    type="file"
                    name="footer_file_one"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                    onChange={(e) => handleFile(e, setFooterOne)}
                  />
                  {existingFooterOneUrl && (
                    <p className="text-xs text-gray-500 mt-2">
                      Actual:{" "}
                      <a
                        href={existingFooterOneUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600"
                      >
                        Ver archivo
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 items-center border-t border-gray-100 pt-6">
                <label className="col-span-12 sm:col-span-3 text-sm font-medium text-gray-700">
                  Segundo Imagen Footer
                </label>
                <div className="col-span-12 sm:col-span-9">
                  <input
                    type="file"
                    name="footer_file_two"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                    onChange={(e) => handleFile(e, setFooterTwo)}
                  />
                  {existingFooterTwoUrl && (
                    <p className="text-xs text-gray-500 mt-2">
                      Actual:{" "}
                      <a
                        href={existingFooterTwoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600"
                      >
                        Ver archivo
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {typeId === 1 && (
                <div className="container-attachment block border-t border-gray-100 pt-6">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <label className="col-span-12 sm:col-span-3 text-sm font-medium text-gray-700">
                      Portada
                    </label>
                    <div className="col-span-12 sm:col-span-9">
                      <input
                        type="file"
                        name="attachment"
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-colors"
                        onChange={(e) => handleFile(e, setAttachment)}
                      />
                      {existingPortadaUrl && (
                        <p className="text-xs text-gray-500 mt-2">
                          Actual:{" "}
                          <a
                            href={existingPortadaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600"
                          >
                            Ver portada actual
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {typeId === 2 && (
                <div className="container-customized border-t border-gray-100 pt-6">
                  <div className="grid grid-cols-12 gap-4">
                    <label className="col-span-12 sm:col-span-3 text-sm font-medium text-gray-700 pt-2">
                      Adjuntar Imagen
                    </label>
                    <div className="col-span-12 sm:col-span-9">
                      <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-inner">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Logo Superior
                            </label>
                            <input
                              type="file"
                              id="input-logo-superior"
                              name="image_top"
                              accept="image/*"
                              className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:font-medium file:bg-white file:text-gray-700 file:border file:border-gray-300 hover:file:bg-gray-50 cursor-pointer"
                              onChange={(e) => handleFile(e, setImageTop)}
                            />
                            {existingImageTopUrl && (
                              <p className="text-xs text-gray-500 mt-2">
                                Actual:{" "}
                                <a
                                  href={existingImageTopUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600"
                                >
                                  Ver archivo
                                </a>
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Imagen Central
                            </label>
                            <input
                              type="file"
                              id="input-imagen-central"
                              name="image_center"
                              accept="image/*"
                              className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:font-medium file:bg-white file:text-gray-700 file:border file:border-gray-300 hover:file:bg-gray-50 cursor-pointer"
                              onChange={(e) => handleFile(e, setImageCenter)}
                            />
                            {existingImageCenterUrl && (
                              <p className="text-xs text-gray-500 mt-2">
                                Actual:{" "}
                                <a
                                  href={existingImageCenterUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600"
                                >
                                  Ver archivo
                                </a>
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Logo Inferior
                            </label>
                            <input
                              type="file"
                              id="input-logo-inferior"
                              name="image_bottom"
                              accept="image/*"
                              className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:font-medium file:bg-white file:text-gray-700 file:border file:border-gray-300 hover:file:bg-gray-50 cursor-pointer"
                              onChange={(e) => handleFile(e, setImageBottom)}
                            />
                            {existingImageBottomUrl && (
                              <p className="text-xs text-gray-500 mt-2">
                                Actual:{" "}
                                <a
                                  href={existingImageBottomUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600"
                                >
                                  Ver archivo
                                </a>
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Imagen de Fondo
                            </label>
                            <input
                              type="file"
                              id="input-imagen-fondo"
                              name="image_background"
                              accept="image/*"
                              className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:font-medium file:bg-white file:text-gray-700 file:border file:border-gray-300 hover:file:bg-gray-50 cursor-pointer"
                              onChange={(e) =>
                                handleFile(e, setImageBackground)
                              }
                            />
                            {existingImageBackgroundUrl && (
                              <p className="text-xs text-gray-500 mt-2">
                                Actual:{" "}
                                <a
                                  href={existingImageBackgroundUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600"
                                >
                                  Ver archivo
                                </a>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Vista Previa
                        </h4>
                        <DevPlaceholder
                          title="Vista previa en desarrollo"
                          message="La vista previa de la portada está en desarrollo. Podrás visualizarla aquí cuando la funcionalidad esté lista."
                          ctaLabel="Vista previa (próximamente)"
                          minHeight={260}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PortadaEditPage;
