// app/components/Footer.tsx
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-12 px-4 border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="e-changes logo"
            className="mx-auto h-12 w-auto"
          />
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
          <a
            href="#contact"
            className="text-gray-800 font-medium hover:text-[#38AC8E] transition-colors duration-200"
          >
            Nous contacter
          </a>
          <a
            href="#privacy"
            className="text-gray-800 font-medium hover:text-[#38AC8E] transition-colors duration-200"
          >
            Politique de confidentialité
          </a>
          <a
            href="#data-usage"
            className="text-gray-800 font-medium hover:text-[#38AC8E] transition-colors duration-200"
          >
            Utilisation des données
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
