// app/components/Footer.tsx
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 py-16 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-12">
          <img
            src="/logo.png"
            alt="e-changes logo"
            className="mx-auto h-16 w-auto"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Nous contacter
            </h3>
            <div className="space-y-3 text-gray-600">
              <p className="font-semibold text-gray-800">
                Association E-changes (loi 1901)
              </p>
              <p>Luc Mégret, Président</p>
              <p>24 rue du président Wilson</p>
              <p>03200 VICHY</p>
              <a
                href="mailto:contact@e-changes.com"
                className="text-[#38AC8E] hover:text-[#2DD4BF] transition-colors duration-200 font-medium"
              >
                contact@e-changes.com
              </a>
            </div>
          </div>

          {/* Legal Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Mentions légales
            </h3>
            <div className="space-y-3 text-gray-600">
              <div>
                <p className="font-semibold text-gray-800">
                  Responsable de publication
                </p>
                <p>Luc Mégret</p>
              </div>
              <div className="pt-4">
                <p className="font-semibold text-gray-800">Nous contacter</p>
                <p>
                  Par email :
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

          {/* Policies */}
          <div>
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
  );
};

export default Footer;
