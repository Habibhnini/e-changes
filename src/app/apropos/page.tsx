import React from "react";
import { Users, Target, Heart, Shield, Zap, Globe } from "lucide-react";
import Link from "next/link";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#38AC8E] to-[#2D8A70] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              À Propos de Nous
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Nous révolutionnons la façon dont les gens échangent des services
              et créent des connexions authentiques dans leur communauté.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Notre Mission
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Nous croyons que chaque personne possède des compétences uniques
              et précieuses. Notre plateforme permet à chacun de partager ses
              talents, d'apprendre de nouveaux savoir-faire et de construire des
              relations durables basées sur l'entraide mutuelle.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              En utilisant un système de crédit énergétique innovant, nous
              créons une économie collaborative où la valeur de chaque service
              est reconnue et respectée.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-4">
              <Target className="w-8 h-8 text-[#38AC8E] mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Vision</h3>
            </div>
            <p className="text-gray-600">
              Créer un monde où les communautés sont plus connectées, plus
              solidaires et où chaque compétence trouve sa place.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos Valeurs
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Les principes qui guident notre approche et façonnent notre
              communauté
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-[#38AC8E]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#38AC8E]/20">
                <Users className="w-8 h-8 text-[#38AC8E]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Communauté
              </h3>
              <p className="text-gray-600">
                Nous favorisons les connexions authentiques et l'entraide entre
                voisins et membres de la communauté.
              </p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-[#38AC8E]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#38AC8E]/20">
                <Heart className="w-8 h-8 text-[#38AC8E]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Bienveillance
              </h3>
              <p className="text-gray-600">
                Chaque interaction est guidée par le respect, la gentillesse et
                l'attention portée aux autres.
              </p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-[#38AC8E]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#38AC8E]/20">
                <Shield className="w-8 h-8 text-[#38AC8E]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Confiance
              </h3>
              <p className="text-gray-600">
                Nous construisons un environnement sûr et transparent où chacun
                peut échanger en toute sérénité.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comment Ça Marche
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Un système simple et équitable basé sur l'échange de services
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-[#38AC8E] w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Publiez votre service
              </h3>
              <p className="text-gray-600">
                Partagez vos compétences et talents avec la communauté.
                Jardinage, bricolage, cours, aide informatique... tout est
                possible !
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-[#38AC8E] w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Connectez-vous
              </h3>
              <p className="text-gray-600">
                Trouvez les services dont vous avez besoin près de chez vous et
                entrez en contact avec les prestataires.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-[#38AC8E] w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Échangez avec équité
              </h3>
              <p className="text-gray-600">
                Utilisez nos crédits énergétiques pour un échange juste et
                équilibré, sans utiliser d'argent traditionnel.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Energy System Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <Zap className="w-10 h-10 text-yellow-500 mr-4" />
                <h3 className="text-2xl font-bold text-gray-900">
                  Système de Crédits Énergétiques
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold">⚡</span>
                  </div>
                  <span className="text-gray-700">
                    Gagnez des crédits en proposant vos services
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold">⚡</span>
                  </div>
                  <span className="text-gray-700">
                    Dépensez vos crédits pour bénéficier de services
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold">⚡</span>
                  </div>
                  <span className="text-gray-700">
                    Système équitable et transparent
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Une Économie Alternative
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Notre système de crédits énergétiques permet de valoriser
                équitablement le temps et les compétences de chacun. Plus besoin
                d'argent liquide, juste un échange juste et transparent.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Chaque service a sa valeur en crédits énergétiques, créant une
                économie circulaire où tout le monde peut contribuer et
                bénéficier selon ses besoins et ses capacités.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#38AC8E] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Notre Impact</h2>
            <p className="text-xl opacity-90">
              Des chiffres qui parlent de notre communauté grandissante
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">no data</div>
              <div className="text-lg opacity-90">Membres actifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">no data</div>
              <div className="text-lg opacity-90">Services échangés</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">no data</div>
              <div className="text-lg opacity-90">Catégories disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">no data</div>
              <div className="text-lg opacity-90">Satisfaction utilisateur</div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Us Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <Globe className="w-16 h-16 text-[#38AC8E] mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Rejoignez Notre Communauté
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Faites partie d'une révolution douce qui transforme nos quartiers
              en communautés solidaires et connectées. Ensemble, créons un monde
              où chaque talent compte et où l'entraide est au cœur de nos
              relations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth"
                className="bg-[#38AC8E] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#2D8A70] transition-colors duration-300 transform hover:scale-105"
              >
                Commencer Maintenant
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
