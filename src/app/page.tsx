"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [heroText, setHeroText] = useState({
    title: "L' E-NERGIE",
    subtitle: "comme monnaie d'échange",
  });
  type FeatureItem = {
    text: string;
    coinValue?: number | string;
    insteadOfText?: string;
    insteadOfValue?: number | string;
    endText?: string;
  };
  const [featuresData, setFeaturesData] = useState<{ items: FeatureItem[] }>({
    items: [],
  });

  useEffect(() => {
    fetch("/hero-text.json")
      .then((response) => response.json())
      .then((data) => setHeroText(data))
      .catch((error) => console.error("Error loading hero text:", error));
  }, []);
  useEffect(() => {
    fetch("/features-list.json")
      .then((response) => response.json())
      .then((data) => setFeaturesData(data))
      .catch((error) => console.error("Error loading features data:", error));
  }, []);
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: 'url("/background.png")',
            backgroundPosition: "center 20%", // Shows more of the bottom portion of the image
          }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-6xl text-center px-4">
              <div className="flex items-center justify-center mb-2">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white ml-2 flex items-center">
                  {heroText.title}
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-white">
                {heroText.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 md:px-14 py-8">
        {/* First Section */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#38AC8E] mb-6">
          Aller vers un monde d'échanges...
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-6 font-semibold">
          De services - mise à disposition de compétences, de connaissances...
        </p>

        {/* Service Cards - First Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              name: "Service à la personne",
              image: "/vaccum.png",
              alt: "House cleaning service",
            },
            {
              name: "Travaux manuels",
              image: "/plombier.png",
              alt: "Manual work service",
            },
            {
              name: "Soins et bien-être",
              image: "/coiffeur.png",
              alt: "Care and wellness service",
            },
            {
              name: "Transports",
              image: "/transport.png",
              alt: "Transportation service",
            },
          ].map((service, index) => (
            <Link
              key={index}
              href={{
                pathname: "/explorer",
                query: { category: encodeURIComponent(service.name) },
              }}
              passHref
            >
              <div className="flex flex-col items-center cursor-pointer">
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-md">
                  <img
                    src={service.image}
                    alt={service.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-center font-semibold text-gray-800 text-lg">
                  {service.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-xl md:text-2xl text-gray-700 mb-6 font-semibold">
          De biens - mise à disposition d'un bien, réalisation d'un objet...
        </p>

        {/* Service Cards - Second Row - Desktop spacing, Mobile grid */}
        <div className="hidden lg:flex flex-row justify-center space-x-48 mb-8">
          {[
            {
              name: "Biens consommables",
              image: "/biens-consommable.png",
              alt: "Consumable goods",
            },
            {
              name: "Biens durables",
              image: "/vente.png",
              alt: "Durable goods",
            },
          ].map((service, index) => (
            <Link
              key={index}
              href={{
                pathname: "/explorer",
                query: { category: encodeURIComponent(service.name) },
              }}
              passHref
            >
              <div className="flex flex-col items-center cursor-pointer">
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-md">
                  <img
                    src={service.image}
                    alt={service.alt}
                    className="w-96 h-96 object-cover"
                  />
                </div>
                <h3 className="text-center font-semibold text-gray-800 text-lg">
                  {service.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile version - Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto lg:hidden">
          {[
            {
              name: "Biens consommables",
              image: "/biens-consommable.png",
              alt: "Consumable goods",
            },
            {
              name: "Biens durables",
              image: "/vente.png",
              alt: "Durable goods",
            },
          ].map((service, index) => (
            <Link
              key={index}
              href={{
                pathname: "/explorer",
                query: { category: encodeURIComponent(service.name) },
              }}
              passHref
            >
              <div className="flex flex-col items-center cursor-pointer">
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-md">
                  <img
                    src={service.image}
                    alt={service.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-center font-semibold text-gray-800 text-lg">
                  {service.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Second Section */}
        <h2 className="text-xl md:text-2xl lg:text-3xl text-[#38AC8E] mb-6 flex items-center">
          ... Dans lequel la "monnaie d'échange" est de L'E-NERGIE
          <span className="ml-2">{"( "}</span>
          <img src="/coin.png" alt="e-nergie logo" className="w-8 h-8 mx-2" />
          <span>{")"}</span>
        </h2>

        {/* Video Placeholder */}
        <video
          className="w-full h-64 md:h-96 mb-12 object-cover rounded-2xl shadow-lg"
          controls
          controlsList="nodownload"
          muted
          loop
          playsInline
          poster="/video-thumbnail.jpg"
        >
          <source src="/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* How It Works Section */}
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-black mb-6">
          Comment ça marche ?
        </h2>
        <p className="text-gray-700 mb-8 font-semibold">
          Notre guide étape par étape vous guidera tout au long du processus
          d'échange de services ou de biens, le rendant simple et sans tracas!
        </p>

        {/* Guide Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {[
            {
              title: "Cherchez un service ou un bien",
              description:
                "Recherchez parmi tous les services, ce dont vous avez besoin",
              image: "/step1.png",
              alt: "Search for a service",
            },
            {
              title: "Communiquez avec l'e-changeur",
              description:
                "Accédez à l'interface de messagerie afin d'expliquer et confirmer votre besoin",
              image: "/step2.png",
              alt: "Communicate with exchanger",
            },
            {
              title: "Validez l'e-change",
              description:
                "Mettez-vous d'accord sur l'e-change à réaliser, validez chacun de votre côté.",
              image: "/check.png",
              alt: "Validez l'e-change",
            },
            {
              title: "Et voilà !",
              description:
                "L'e-changeur rend le service ou échange le bien et la somme d'énergie vous est débitée",
              image: "/step3.png",
              alt: "Service completed",
            },
          ].map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-white flex items-center justify-center mb-6 relative overflow-hidden shadow-lg">
                <img
                  src={step.image}
                  alt={step.alt}
                  className="w-24 h-24 md:w-40 md:h-40 object-contain"
                />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="py-8 md:py-16 px-0">
          <div className="max-w-7xl mx-auto">
            {/* Main Title */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-8 md:mb-16 tracking-wide">
              S’AUTORISER UN NOUVEL ETAT D&#39;ÊTRE ET SE RECENTRER SUR NOS
              VALEURS HUMAINES.
            </h2>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left side - Image */}
              <div className="flex justify-center order-2 lg:order-1">
                <img
                  src="/hands.png"
                  alt="Hands forming a heart - community connection"
                  className="w-full max-w-sm md:max-w-md h-auto object-contain"
                />
              </div>

              {/* Right side - Content */}
              <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Confiance
                    </h3>
                    <p className="text-gray-600">
                      Osez croire en vous ! Ayez confiance dans vos talents –
                      compétences, savoir-faire, expériences dans tous les
                      domaines de la vie – personnel, professionnel, sportif,
                      associatif…
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Discernement
                    </h3>
                    <p className="text-gray-600">
                      Évaluez la pertinence des services au regard de vos
                      compétences réelles et de l'état des biens que vous
                      proposez. S'agissant de la valeur de ce que vous offrez,
                      faites confiance aussi à l'intelligence de la négociation,
                      et apprenez à ajuster votre proposition.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Responsabilité
                    </h3>
                    <p className="text-gray-600">
                      Prenez la pleine responsabilité de vos actions, vis-à-vis
                      de vous et des autres. C'est-à-dire, listez pour vous et,
                      si besoin avec la personne bénéficiaire, les conséquences
                      éventuelles de l'utilisation du bien ou de la réalisation
                      du service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* New Section - E-changes Guidelines */}
        <div className="py-8 md:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Title */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-12 tracking-wide">
              POUR DES E-CHANGES EN BONNE INTELLIGENCE
            </h2>

            {/* Guidelines List */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 border-l-4 border-[#38AC8E] bg-white rounded-r-lg shadow-sm">
                <span className="text-2xl font-bold text-[#38AC8E] min-w-[2rem]">
                  1.
                </span>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Des e-changes entre personnes majeures.
                </p>
              </div>

              <div className="flex items-start space-x-4 p-4 border-l-4 border-[#38AC8E] bg-white rounded-r-lg shadow-sm">
                <span className="text-2xl font-bold text-[#38AC8E] min-w-[2rem]">
                  2.
                </span>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Aucun bien ou service prohibé ne peut être e-changé.
                </p>
              </div>

              <div className="flex items-start space-x-4 p-4 border-l-4 border-[#38AC8E] bg-white rounded-r-lg shadow-sm">
                <span className="text-2xl font-bold text-[#38AC8E] min-w-[2rem]">
                  3.
                </span>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Pour des prêts de biens (moyens de transport, hébergement,
                  outillage…), il est recommandé de vérifier l'identité du
                  bénéficiaire.
                </p>
              </div>

              <div className="flex items-start space-x-4 p-4 border-l-4 border-[#38AC8E] bg-white rounded-r-lg shadow-sm">
                <span className="text-2xl font-bold text-[#38AC8E] min-w-[2rem]">
                  4.
                </span>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Toute violence, insulte ou non-respect des engagements pris
                  lors des transactions est proscrit et pourra faire l'objet
                  d'un signalement qui peut conduire à l'exclusion de l'adhérant
                  temporairement ou définitivement.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-300 rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center relative">
            <div className="p-12 md:pl-36">
              <ul className="space-y-6">
                {featuresData.items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-3 h-3 bg-gray-800 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <h4 className="text-xl font-bold leading-relaxed">
                      {item.text} {item.coinValue}{" "}
                      <img
                        src="/coin.png"
                        alt="e-nergie"
                        className="inline w-6 h-5 mx-1"
                      />
                      {item.insteadOfText} {item.insteadOfValue}{" "}
                      <img
                        src="/coin.png"
                        alt="e-nergie"
                        className="inline w-6 h-5 mx-1"
                      />
                      {item.endText}
                    </h4>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden md:flex h-full mr-24">
              <Image
                src="/images/referral-illustration.png"
                alt="Referral illustration"
                width={480}
                height={320}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
