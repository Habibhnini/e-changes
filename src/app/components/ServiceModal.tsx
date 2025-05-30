"use client";
import React, { useState, useEffect, useRef } from "react";

import {
  IoClose,
  IoCloudUpload,
  IoTrash,
  IoImage,
  IoEye,
  IoPencil,
  IoStop,
  IoPlay,
} from "react-icons/io5";
import Image from "next/image";

interface ServiceModalProps {
  type: "service" | "bien";
  vendorId: number;
  onClose: () => void;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDepublished?: () => void;
  mode: "create" | "view" | "edit";
  serviceData?: any; // The service data when viewing/editing
}

interface ImagePreview {
  file?: File;
  preview: string;
  id: string;
  isExisting?: boolean;
  filename?: string;
  url?: string;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  type,
  vendorId,
  onClose,
  onCreated,
  onUpdated,
  onDepublished,
  mode,
  serviceData,
}) => {
  const [currentMode, setCurrentMode] = useState(mode);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [originalImages, setOriginalImages] = useState<ImagePreview[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDepublishConfirm, setShowDepublishConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((currentMode === "view" || currentMode === "edit") && serviceData) {
      setTitle(serviceData.title || "");
      setDescription(serviceData.description || "");
      setPrice(serviceData.price || "");
      setCategoryId(serviceData.category?.id || "");

      // Convert existing images to ImagePreview format
      if (serviceData.images && serviceData.images.length > 0) {
        const existingImages: ImagePreview[] = serviceData.images.map(
          (img: any) => ({
            id: img.id.toString(),
            preview: `${process.env.NEXT_PUBLIC_API_URL}${img.url}`,
            isExisting: true,
            filename: img.filename,
            url: img.url,
          })
        );
        setImages(existingImages);
        setOriginalImages(existingImages); // Track original images for edit mode

        // Set primary image
        const primaryImg = existingImages.find((img) =>
          serviceData.images.find(
            (si: any) => si.id.toString() === img.id && si.isPrimary
          )
        );
        if (primaryImg) {
          setPrimaryImageId(primaryImg.id);
        }
      } else {
        setOriginalImages([]); // Reset if no images
      }
    }
  }, [currentMode, serviceData]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`/api/service/categories`);
        if (!res.ok) throw new Error("Échec chargement catégories");
        const data = await res.json();
        setCategories(data.categories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchCategories();
  }, []);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (!img.isExisting && img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, []);

  const getFullImageUrl = (url: string): string => {
    if (!url) return "/logo.jpg";
    if (url.startsWith("http")) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    return url.startsWith("/uploads/")
      ? `${apiUrl}${url}`
      : `${apiUrl}/uploads/services/${url}`;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentMode === "view") return;

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setError("Seuls les fichiers JPG, PNG et WebP sont autorisés");
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError("Chaque image doit faire moins de 10MB");
      return;
    }

    if (images.length + files.length > 10) {
      setError("Maximum 10 images autorisées");
      return;
    }

    setError("");

    const newImages: ImagePreview[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      isExisting: false,
    }));

    setImages((prev) => [...prev, ...newImages]);

    if (images.length === 0 && newImages.length > 0) {
      setPrimaryImageId(newImages[0].id);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (imageId: string) => {
    if (currentMode === "view") return;

    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove && !imageToRemove.isExisting) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      const remaining = prev.filter((img) => img.id !== imageId);

      if (primaryImageId === imageId && remaining.length > 0) {
        setPrimaryImageId(remaining[0].id);
      } else if (remaining.length === 0) {
        setPrimaryImageId("");
      }

      return remaining;
    });
  };

  const setPrimary = (imageId: string) => {
    if (currentMode === "view") return;
    setPrimaryImageId(imageId);
  };

  const handleDepublish = async () => {
    if (!serviceData?.id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/service/${serviceData.id}/depublish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Erreur lors de la dépublication");
        return;
      }

      onDepublished?.();
      onClose();
    } catch (err) {
      setError("Erreur réseau lors de la dépublication");
    } finally {
      setIsSubmitting(false);
      setShowDepublishConfirm(false);
    }
  };

  const handlePublish = async () => {
    if (!serviceData?.id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/service/${serviceData.id}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Erreur lors de la publication");
        return;
      }

      onUpdated?.(); // Use onUpdated to refresh the data
      onClose();
    } catch (err) {
      setError("Erreur réseau lors de la publication");
    } finally {
      setIsSubmitting(false);
      setShowPublishConfirm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || price === "" || categoryId === "") {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price.toString());
      formData.append("type", type);
      formData.append("status", "published");
      formData.append("requiresApproval", "false");
      formData.append("vendorId", vendorId.toString());
      formData.append("categoryId", categoryId.toString());

      // Handle images for create/update
      let imageIndex = 0;
      const newImages = images.filter((img) => !img.isExisting);
      const existingImages = images.filter((img) => img.isExisting);

      // Determine if primary image is a new upload or existing
      const primaryIsNewImage = newImages.some(
        (img) => img.id === primaryImageId
      );
      const primaryIsExistingImage = existingImages.some(
        (img) => img.id === primaryImageId
      );

      // Add new images
      newImages.forEach((img) => {
        if (img.file) {
          formData.append("images[]", img.file);
          if (String(img.id) === String(primaryImageId)) {
            formData.append("primaryImageIndex", imageIndex.toString());
          }
          imageIndex++;
        }
      });
      if (
        primaryIsNewImage &&
        !Array.from(formData.keys()).includes("primaryImageIndex")
      ) {
        console.warn("⚠️ primaryImageIndex was not set correctly.");
      }

      // For updates, send existing image info and deleted image IDs
      if (currentMode === "edit" && serviceData?.id) {
        // Send existing images as JSON string
        const existingImagePayload = existingImages.map((img) => ({
          id: img.id,
          isPrimary: !primaryIsNewImage && img.id === primaryImageId,
        }));
        formData.append("existingImages", JSON.stringify(existingImagePayload));

        // Include deleted image IDs
        const deletedImages = originalImages.filter(
          (originalImg) => !images.some((img) => img.id === originalImg.id)
        );

        deletedImages.forEach((img) => {
          formData.append("deletedImageIds[]", img.id);
        });

        // Add method override
        formData.append("_method", "PUT");
      }

      // Add a flag to indicate which type of image is primary
      if (primaryIsNewImage) {
        formData.append("primaryImageType", "new");
      } else if (primaryIsExistingImage || primaryImageId) {
        // If we have a primaryImageId but it's not a new image, it must be existing
        formData.append("primaryImageType", "existing");
      }

      // Debug logging

      const url =
        currentMode === "edit" && serviceData?.id
          ? `/api/service/${serviceData.id}`
          : "/api/service";

      const method = "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError(responseData.error || "Erreur lors de l'opération");
        setIsSubmitting(false);
        return;
      }

      if (currentMode === "edit") {
        onUpdated?.();
      } else {
        onCreated?.();
      }

      onClose();
    } catch (err) {
      console.error(err);
      setError("Erreur réseau");
      setIsSubmitting(false);
    }
  };
  const getModalTitle = () => {
    const serviceType = type === "service" ? "service" : "bien";
    switch (currentMode) {
      case "create":
        return `Ajouter un ${serviceType}`;
      case "view":
        return `Détails du ${serviceType}`;
      case "edit":
        return `Modifier le ${serviceType}`;
      default:
        return `${serviceType}`;
    }
  };

  const submitBtnColor =
    type === "service"
      ? "bg-[#38AC8E] hover:bg-teal-600"
      : "bg-[#DEB887] hover:bg-[#C8A275]";

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {getModalTitle()}
          </h2>
          <div className="flex gap-2 items-center">
            {/* Mode Toggle Buttons */}
            {serviceData && currentMode === "view" && (
              <button
                onClick={() => setCurrentMode("edit")}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors text-xs sm:text-sm"
              >
                <IoPencil size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Modifier</span>
              </button>
            )}

            {serviceData && currentMode === "edit" && (
              <button
                onClick={() => setCurrentMode("view")}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition-colors text-xs sm:text-sm"
              >
                <IoEye size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Voir</span>
              </button>
            )}

            {/* Depublish Button */}
            {serviceData && serviceData.status === "published" && (
              <button
                onClick={() => setShowDepublishConfirm(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors text-xs sm:text-sm"
              >
                <IoStop size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Dépublier</span>
              </button>
            )}

            {/* Publish Button */}
            {serviceData && serviceData.status !== "published" && (
              <button
                onClick={() => setShowPublishConfirm(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors text-xs sm:text-sm"
              >
                <IoPlay size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Publier</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors p-1"
              aria-label="Fermer"
            >
              <IoClose size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                {currentMode === "view" ? (
                  <div className="p-2.5 bg-gray-50 rounded-md border">
                    {title}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nom du service/bien"
                  />
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                {currentMode === "view" ? (
                  <div className="p-2.5 bg-gray-50 rounded-md border min-h-[80px]">
                    {description}
                  </div>
                ) : (
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description détaillée"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant d’e *
                </label>
                {currentMode === "view" ? (
                  <div className="p-2.5 bg-gray-50 rounded-md border">
                    {price} e-€
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="0"
                      min="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">e-€</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                {currentMode === "view" ? (
                  <div className="p-2.5 bg-gray-50 rounded-md border">
                    {categories.find((cat) => cat.id === categoryId)?.name ||
                      "Non définie"}
                  </div>
                ) : (
                  <select
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white"
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Status Display for View Mode */}
            {currentMode === "view" && serviceData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <div
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    serviceData.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {serviceData.status === "published" ? "Publié" : "Dépublié"}
                </div>
              </div>
            )}

            {/* Image Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images{" "}
                {currentMode !== "view" &&
                  "(maximum 10, formats: JPG, PNG, WebP)"}
              </label>

              {/* Upload Button - Only show in create/edit mode */}
              {currentMode !== "view" && (
                <div className="mb-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-teal-500 hover:bg-teal-50 transition-colors"
                    disabled={images.length >= 10}
                  >
                    <IoCloudUpload className="text-gray-500" />
                    <span className="text-gray-600">
                      {images.length >= 10
                        ? "Maximum atteint"
                        : "Ajouter des images"}
                    </span>
                  </button>
                </div>
              )}

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {images.map((img) => (
                    <div key={img.id} className="relative group">
                      <div
                        className={`relative aspect-square rounded-md overflow-hidden border-2 ${
                          primaryImageId === img.id
                            ? "border-teal-500"
                            : "border-gray-300"
                        }`}
                      >
                        <Image
                          src={
                            img.isExisting
                              ? getFullImageUrl(img.url || "")
                              : img.preview
                          }
                          alt="Preview"
                          fill
                          className="object-cover"
                        />

                        {/* Primary Badge */}
                        {primaryImageId === img.id && (
                          <div className="absolute top-1 left-1 bg-teal-500 text-white text-xs px-2 py-1 rounded">
                            Principal
                          </div>
                        )}

                        {/* Action Buttons - Only show in create/edit mode */}
                        {currentMode !== "view" && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {primaryImageId !== img.id && (
                              <button
                                type="button"
                                onClick={() => setPrimary(img.id)}
                                className="bg-white text-gray-700 p-1.5 rounded hover:bg-gray-100"
                                title="Définir comme image principale"
                              >
                                <IoImage size={16} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(img.id)}
                              className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600"
                              title="Supprimer"
                            >
                              <IoTrash size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {images.length > 0 && currentMode !== "view" && (
                <p className="text-xs text-gray-500 mt-2">
                  Cliquez sur une image pour la définir comme principale.
                  L'image principale sera affichée en premier dans les listes.
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                {currentMode === "view" ? "Fermer" : "Annuler"}
              </button>
              {(currentMode === "create" || currentMode === "edit") && (
                <button
                  type="submit"
                  className={`${submitBtnColor} text-white px-5 py-2 rounded-md transition-colors shadow-sm font-medium`}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? currentMode === "edit"
                      ? "Modification..."
                      : "Création..."
                    : currentMode === "edit"
                    ? "Modifier"
                    : "Créer"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Depublish Confirmation Modal */}
      {showDepublishConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Confirmer la dépublication
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir dépublier ce{" "}
              {type === "service" ? "service" : "bien"} ? Il ne sera plus
              visible par les autres utilisateurs.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDepublishConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                onClick={handleDepublish}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Dépublication..." : "Dépublier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Confirmer la publication
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir publier ce{" "}
              {type === "service" ? "service" : "bien"} ? Il sera visible par
              tous les utilisateurs.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publication..." : "Publier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceModal;
