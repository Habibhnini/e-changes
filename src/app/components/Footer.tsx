// app/components/Footer.tsx
"use client";
import React, { useState } from "react";

const Footer: React.FC = () => {
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);

  const openContactPopup = () => {
    setIsContactPopupOpen(true);
  };

  const closeContactPopup = () => {
    setIsContactPopupOpen(false);
  };

  return (
    <>
      <footer className="bg-gray-50 py-16 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="text-center mb-12">
            <img
              src="/logo.png"
              alt="e-changes logo"
              className="mx-auto h-16 w-auto"
            />
          </div>

          {/* Main Content Grid - Now 2 columns */}
          <div className="grid md:grid-cols-2 gap-16 mb-12">
            {/* Contact Information */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Informations Générales
              </h3>
              <div className="space-y-3 text-gray-600">
                <p className="font-semibold text-gray-800">
                  Association E-changes (loi 1901)
                </p>
                <p>03200 VICHY</p>

                <button
                  onClick={openContactPopup}
                  className="font-semibold text-gray-800 hover:text-[#38AC8E] transition-colors duration-200 cursor-pointer underline hover:no-underline"
                >
                  Nous contacter
                </button>
              </div>
            </div>

            {/* Legal Information */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Informations légales
              </h3>
              <div className="space-y-4">
                <a
                  href="#privacy"
                  className="block text-gray-600 hover:text-[#38AC8E] transition-colors duration-200 font-medium"
                >
                  Politique de confidentialité
                </a>
                <a
                  href="#data-usage"
                  className="block text-gray-600 hover:text-[#38AC8E] transition-colors duration-200 font-medium"
                >
                  Utilisation des données
                </a>
                <a
                  href="#terms"
                  className="block text-gray-600 hover:text-[#38AC8E] transition-colors duration-200 font-medium"
                >
                  Conditions générales
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © 2024 Association E-changes. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Popup */}
      {isContactPopupOpen && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-2xl">
            {/* Close button */}
            <button
              onClick={closeContactPopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Popup content */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Nous contacter
              </h3>
              <div className="space-y-4 text-gray-600">
                <div>
                  <p className="font-semibold text-gray-800">
                    Responsable de publication
                  </p>
                  <p>Luc Mégret</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800">Contact</p>
                  <p>
                    Email :
                    <a
                      href="mailto:contact@e-changes.com"
                      className="text-[#38AC8E] hover:text-[#2DD4BF] transition-colors duration-200 font-medium ml-1"
                    >
                      contact@e-changes.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
