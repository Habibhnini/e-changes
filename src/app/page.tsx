import Image from "next/image";

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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* First Section */}
        <h2 className="text-2xl md:text-3xl text-emerald-600 mb-6">
          Aller vers un monde d'échanges...
        </h2>
        <p className="text-gray-700 mb-6">
          De services - mise à disposition de compétences, de connaissances...
        </p>

        {/* Service Cards - First Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="bg-orange-200 rounded-lg p-4">
              <div className="h-40 relative">
                <div className="absolute bottom-0 left-0 right-0">
                  <img
                    src="/api/placeholder/200/200"
                    alt="Person vacuuming"
                    className="mx-auto"
                  />
                </div>
              </div>
              <p className="mt-2 text-center">Service {index}</p>
            </div>
          ))}
        </div>

        <p className="text-gray-700 mb-6">
          De services - mise à disposition de compétences, de connaissances...
        </p>

        {/* Service Cards - Second Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {[1, 2].map((index) => (
            <div key={index} className="bg-orange-200 rounded-lg p-4">
              <div className="h-40 relative">
                <div className="absolute bottom-0 left-0 right-0">
                  <img
                    src="/api/placeholder/200/200"
                    alt="Person with household tasks"
                    className="mx-auto"
                  />
                </div>
              </div>
              <p className="mt-2 text-center">Service {index}</p>
            </div>
          ))}
        </div>

        {/* Second Section */}
        <h2 className="text-2xl md:text-3xl text-emerald-600 mb-6">
          ... Dans lequel la "monnaie d'échange" est de l'énergie
        </h2>

        {/* Video Placeholder */}
        <div className="bg-black w-full h-64 md:h-96 mb-12"></div>

        {/* How It Works Section */}
        <h2 className="text-2xl md:text-3xl text-emerald-600 mb-6">
          Comment ça marche ?
        </h2>
        <p className="text-gray-700 mb-8">
          Notre guide étape par étape vous guidera tout au long du processus
          d'échange de services ou de biens, le rendant simple et sans tracas!
        </p>

        {/* Guide Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-red-300 rounded-lg h-40"></div>
          <div className="bg-red-300 rounded-lg h-40"></div>
        </div>

        {/* Search Section */}
        <div className="text-center mb-12">
          <p className="mb-4">Cherchez un service</p>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded">
            fwvfwvf
          </button>
        </div>
      </div>
    </div>
  );
}
