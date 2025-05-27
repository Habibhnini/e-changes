"use client";
import React, { useState, useEffect, useRef } from "react";
import { IoClose, IoCloudUpload, IoTrash, IoImage } from "react-icons/io5";

interface ServiceModalProps {
  type: "service" | "bien";
  vendorId: number;
  onClose: () => void;
  onCreated: () => void;
}

interface ImagePreview {
  file: File;
  preview: string;
  id: string;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  type,
  vendorId,
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`/api/service/categories`);
        if (!res.ok) throw new Error("Échec chargement catégories");
        const data = await res.json();
        setCategories(data.categories);
      } catch (err) {}
    }
    fetchCategories();
  }, []);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setError("Seuls les fichiers JPG, PNG et WebP sont autorisés");
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError("Chaque image doit faire moins de 5MB");
      return;
    }

    // Check total images limit (max 10)
    if (images.length + files.length > 10) {
      setError("Maximum 10 images autorisées");
      return;
    }

    setError("");

    const newImages: ImagePreview[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setImages((prev) => [...prev, ...newImages]);

    // Set first image as primary if no primary set
    if (images.length === 0 && newImages.length > 0) {
      setPrimaryImageId(newImages[0].id);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      const remaining = prev.filter((img) => img.id !== imageId);

      // If removed image was primary, set first remaining as primary
      if (primaryImageId === imageId && remaining.length > 0) {
        setPrimaryImageId(remaining[0].id);
      } else if (remaining.length === 0) {
        setPrimaryImageId("");
      }

      return remaining;
    });
  };

  const setPrimary = (imageId: string) => {
    setPrimaryImageId(imageId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || price === "" || categoryId === "") {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (images.length === 0) {
      setError("Veuillez ajouter au moins une image");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price.toString());
      formData.append("type", type);
      formData.append("status", "published");
      formData.append("requiresApproval", "false");
      formData.append("vendorId", vendorId.toString());
      formData.append("categoryId", categoryId.toString());

      // Add images
      images.forEach((img, index) => {
        formData.append("images[]", img.file);
        formData.append(`imageOrder[${index}]`, index.toString());

        // Mark primary image
        if (img.id === primaryImageId) {
          formData.append("primaryImageIndex", index.toString());
        }
      });

      const res = await fetch("/api/service", {
        method: "POST",
        body: formData, // Don't set Content-Type header, let browser set it
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(
          errData.error || errData.errors
            ? Object.values(errData.errors).join(", ")
            : "Erreur création"
        );
        setIsSubmitting(false);
        return;
      }

      // Success
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Erreur réseau");
      setIsSubmitting(false);
    }
  };

  const modalTitle =
    type === "service" ? "Ajouter un service" : "Ajouter un bien";
  const submitBtnColor =
    type === "service"
      ? "bg-[#38AC8E] hover:bg-teal-600"
      : "bg-[#DEB887] hover:bg-[#C8A275]";

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Fermer"
          >
            <IoClose size={24} />
          </button>
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
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nom du service/bien"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description détaillée"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix (en e-changes) *
                </label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
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
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images * (maximum 10, formats: JPG, PNG, WebP)
              </label>

              {/* Upload Button */}
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
                        <img
                          src={img.preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />

                        {/* Primary Badge */}
                        {primaryImageId === img.id && (
                          <div className="absolute top-1 left-1 bg-teal-500 text-white text-xs px-2 py-1 rounded">
                            Principal
                          </div>
                        )}

                        {/* Action Buttons */}
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
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {images.length > 0 && (
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
                Annuler
              </button>
              <button
                type="submit"
                className={`${submitBtnColor} text-white px-5 py-2 rounded-md transition-colors shadow-sm font-medium`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Création..." : "Créer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
