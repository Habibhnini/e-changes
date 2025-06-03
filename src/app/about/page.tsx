import React from "react";
import { Target, Zap, Globe, UserCheck, Eye, Star } from "lucide-react";
import Link from "next/link";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#38AC8E] to-[#2D8A70] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Qui sommes-nous ?
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              E-changes est une association qui a pour objet de favoriser les
              réels liens humains en facilitant les libres échanges responsables
              et bienveillants au sein de la communauté de ses adhérents.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
              Notre ADN
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-[#38AC8E] to-[#2DD4BF] mx-auto rounded-full"></div>
          </div>

          {/* Main Content */}
          <div className="relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#38AC8E] opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2DD4BF] opacity-5 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-8">
              {/* Philosophy blocks */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <p className="text-xl text-gray-700 leading-relaxed">
                  De revenir à des{" "}
                  <span className="font-bold text-[#38AC8E]">
                    partages simples mais connectés
                  </span>{" "}
                  dans le respect de ce qui fait notre humanité.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <p className="text-xl text-gray-700 leading-relaxed">
                  C'est pour cela que nous avons créé un{" "}
                  <span className="font-bold text-[#38AC8E]">
                    espace nouveau de liberté
                  </span>
                  .
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#38AC8E]/10 to-[#2DD4BF]/10 rounded-2xl p-8 border-l-4 border-[#38AC8E]">
                <p className="text-xl text-gray-700 leading-relaxed font-medium">
                  Utiliser E-changes, c'est emprunter un chemin vers la{" "}
                  <span className="text-[#38AC8E] font-bold">
                    responsabilité
                  </span>
                  . C'est se permettre de s'émanciper des règles et des lois
                  innombrables pour mettre enfin en œuvre nos seules véritables
                  obligations, celles du bon sens et de la loi naturelle.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <p className="text-xl text-gray-700 leading-relaxed">
                  C'est s'affranchir du regard paternel et de plus en plus
                  inflexible du pouvoir en place. C'est s'extraire du sein
                  maternant mais infantilisant de la société pour se prendre par
                  la main. C'est se mettre en route vers l'
                  <span className="font-bold text-[#38AC8E]">émancipation</span>
                  .
                </p>
              </div>

              {/* Invitation Section */}
              <div className="bg-gradient-to-r from-[#38AC8E] to-[#2DD4BF] rounded-3xl shadow-2xl p-8 md:p-12 text-white">
                <div className="max-w-4xl mx-auto text-center">
                  <h3 className="text-2xl md:text-3xl font-bold mb-6">
                    Prêt pour l'aventure ?
                  </h3>

                  <div className="space-y-4 text-lg leading-relaxed mb-8">
                    <p>
                      Si vous voulez tenter cette aventure, l'espace d'e-changes
                      est là pour cela. Si vous savez qu'un autre monde est
                      possible mais à créer, découvrons ensemble de quoi nous
                      sommes capables lorsque nous sommes reliés.
                    </p>

                    <p>
                      C'est un saut dans l'inconnu auquel nous invitons celles
                      et ceux qui n'ont pas renoncé et qui ont compris qu'il est
                      l'heure de s'engager et d'initier le changement dans notre
                      propre vie.
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold mb-4">
                      Soyez les bienvenus dans ce nouveau monde !
                    </p>

                    <div className="flex justify-center items-center space-x-4">
                      <div className="w-16 h-0.5 bg-white opacity-50"></div>
                      <p className="text-xl font-medium">Caroline & Luc</p>
                      <div className="w-16 h-0.5 bg-white opacity-50"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Notre Vision - Moved to end */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mt-12">
                <div className="flex items-center mb-4">
                  <Target className="w-8 h-8 text-[#38AC8E] mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Notre Vision
                  </h3>
                </div>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Découvrir une autre richesse que la richesse monétaire.
                </p>
              </div>
            </div>
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
              Pour nous, le changement de monde commence par un changement
              intérieur.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-[#38AC8E]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#38AC8E]/20">
                <Star className="w-8 h-8 text-[#38AC8E]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Confiance
              </h3>
              <p className="text-gray-600">
                Osez croire en vous ! Ayez confiance dans vos talents –
                compétences, savoir-faire, expériences dans tous les domaines de
                la vie – personnel, professionnel, sportif, associatif…
              </p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-[#38AC8E]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#38AC8E]/20">
                <Eye className="w-8 h-8 text-[#38AC8E]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Discernement
              </h3>
              <p className="text-gray-600">
                Évaluez la pertinence des services au regard de vos compétences
                réelles et de l'état des biens que vous proposez. S'agissant de
                la valeur de ce que vous offrez, faites confiance aussi à
                l'intelligence de la négociation, et apprenez à ajuster votre
                proposition.
              </p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-[#38AC8E]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#38AC8E]/20">
                <UserCheck className="w-8 h-8 text-[#38AC8E]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Responsabilité
              </h3>
              <p className="text-gray-600">
                Prenez la pleine responsabilité de vos actions, vis-à-vis de
                vous et des autres. C'est-à-dire, listez pour vous et, si besoin
                avec la personne bénéficiaire, les conséquences éventuelles de
                l'utilisation du bien ou de la réalisation du service.
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
                    Accumulez de l’énergie à chaque e-changes réalisés
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold">⚡</span>
                  </div>
                  <span className="text-gray-700">
                    Utilisez vos énergies pour bénéficier de biens et services
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold">⚡</span>
                  </div>
                  <span className="text-gray-700">
                    Système concret fondé sur la richesse des valeurs humaines
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Une Économie Alternative
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Notre système de crédits énergétiques permet de mettre en
                lumière ce qui existe déjà, c’est-à- dire que lors de chaque
                relation, c’est déjà de l’énergie que nous échangeons. Et ainsi,
                nous n’aurons plus toujours besoin d&#39;argent liquide,
                simplement des échanges justes et transparents. Grâce à ce
                système, les personnes qui sont habituées à donner sont invitées
                désormais aussi à recevoir pour que l’énergie circule encore
                mieux.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                A l’image de la technologie blockchains des cryptomonnaies, il
                est possible d’interagir de façon complètement décentralisée
                pour les échanges du quotidien, pouvant répondre notamment aux
                besoins vitaux – alimentation, déplacement, prêt de matériels...
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

          <div className="grid md:grid-cols-3 gap-8 text-center">
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
              <div className="text-lg opacity-90">
                nombre de départements actifs
              </div>
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
