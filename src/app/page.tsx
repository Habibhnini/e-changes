import Image from "next/image";
import Link from "next/link";

export default function Home() {
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-6xl text-center px-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                L'ENERGIE
              </h1>
              <p className="text-xl md:text-2xl text-white">
                comme monnaie d'échange
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-14 py-8">
        {/* First Section */}
        <h1 className="text-4xl md:text-4xl font-bold text-[#38AC8E] mb-6">
          Aller vers un monde d'échanges...
        </h1>
        <p className="text-2xl text-gray-700 mb-6 font-semibold">
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

        <p className="text-2xl text-gray-700 mb-6 font-semibold">
          De biens - mise à disposition d'un bien, réalisation d'un objet...
        </p>

        {/* Service Cards - Second Row */}
        <div className="flex flex-row justify-center space-x-48">
          {[
            {
              name: "Biens consommables",
              image: "/achat.png",
              alt: "House cleaning service",
            },
            {
              name: "Biens durables",
              image: "/vente.png",
              alt: "Manual work service",
            },
          ].map((service, index) => (
            <div key={index} className="flex flex-col items-center">
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
          ))}
        </div>

        {/* Second Section */}
        <h2 className="text-2xl md:text-3xl text-[#38AC8E] mb-6">
          ... Dans lequel la "monnaie d'échange" est de l'énergie
        </h2>

        {/* Video Placeholder */}
        <div className="bg-black w-full h-64 md:h-96 mb-12"></div>

        {/* How It Works Section */}
        <h2 className="text-2xl md:text-3xl font-semibold text-black mb-6">
          Comment ça marche ?
        </h2>
        <p className="text-gray-700 mb-8 font-semibold">
          Notre guide étape par étape vous guidera tout au long du processus
          d'échange de services ou de biens, le rendant simple et sans tracas!
        </p>

        {/* Guide Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            {
              title: "Cherchez un service",
              description:
                "Recherchez parmi tous les services, ce dont vous avez besoin",
              image: "/step1.png", // You'll replace this
              alt: "Search for a service",
            },
            {
              title: "Communiquez avec l'e-changeur",
              description:
                "Accédez à l'interface de messagerie afin d'expliquer et confirmer votre besoin",
              image: "/step2.png", // You'll replace this
              alt: "Communicate with exchanger",
            },
            {
              title: "Et voilà !",
              description:
                "L'e-changeur rend le service ou échange le bien et la somme d'énergie vous est débitée",
              image: "/step3.png", // You'll replace this
              alt: "Service completed",
            },
          ].map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-48 h-48 rounded-full bg-white flex items-center justify-center mb-6 relative overflow-hidden shadow-lg">
                <img
                  src={step.image}
                  alt={step.alt}
                  className="w-40 h-40 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Search Section */}
        <div className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Main Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16 tracking-wide">
              UN ETAT D'ÊTRE ET UN RÉSEAU HUMAIN ET RÉEL
            </h2>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Image */}
              <div className="flex justify-center">
                <img
                  src="/hands.png"
                  alt="Hands forming a heart - community connection"
                  className="w-full max-w-md h-auto object-contain"
                />
              </div>

              {/* Right side - Content */}
              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold text-[#38AC8E] mb-6">
                  DES E-CHANGES BIENVEILLANTS ET PAISIBLES
                </h3>

                <p className="text-gray-700 text-lg leading-relaxed">
                  Les discussions pour se mettre d'accord sur la nature de
                  l'echange et la quantité d'enerG se font paisiblement, avec
                  respect. L'accord entre les deux e-changeurs doit être juste
                  pour les deux. La quantité d'enerG peut être différente de
                  celle proposée initialement sur le profil de l'e-changeur si
                  les deux personnes se mettent d'accord. Par exemple, un
                  e-changeur propose un service d'1 heure de plomberie estimée à
                  45 enerG mais réalisée à 30 enerG parce que l'autre e-
                  changeur lui propose de lui apporter des légumes de son
                  jardin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
