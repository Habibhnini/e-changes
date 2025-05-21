"use client";
import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

interface ServiceModalProps {
  type: "service" | "bien";
  vendorId: number;
  onClose: () => void;
  onCreated: () => void;
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
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`/api/service/categories`);
        if (!res.ok) throw new Error("Échec chargement catégories");
        const data = await res.json();
        setCategories(data.categories);
      } catch (err) {
        //  console.error(err);
      }
    }
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || price === "" || categoryId === "") {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        description,
        price,
        type, // This is either "service" or "bien" from props
        status: "published",
        requiresApproval: false,
        vendorId,
        categoryId,
      };

      const res = await fetch("/api/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      //  console.error(err);
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
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
          aria-label="Fermer"
        >
          <IoClose size={24} />
        </button>
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {modalTitle}
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom du service"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
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
              Prix (en e-changes)
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
              Catégorie
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

          <div className="flex justify-end pt-2">
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
  );
};

export default ServiceModal;
