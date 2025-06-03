// RegistrationStep2.tsx
import React, { useState } from "react";
import { ImEnlarge2 } from "react-icons/im";

interface RegistrationStep2Props {
  acceptTerms: boolean;
  setAcceptTerms: (accept: boolean) => void;
  handleRegistrationNext: (e: React.FormEvent) => void;
  handleRegistrationBack: () => void;
  error: string;
  setActiveTab: (tab: string) => void;
}

const RegistrationStep2: React.FC<RegistrationStep2Props> = ({
  acceptTerms,
  setAcceptTerms,
  handleRegistrationNext,
  handleRegistrationBack,
  error,
  setActiveTab,
}) => {
  const [showFullDocument, setShowFullDocument] = useState(false);

  const ReglementContent = () => (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Règlement intérieur de l'association E-changes
        </h3>
        <p className="text-gray-600 italic">
          pour faciliter les échanges et les partages entre les membres de
          l'association
        </p>
        <p className="text-gray-600 italic">
          via la bonne utilisation de l'application e-changes.com
        </p>
        <p className="text-sm font-medium text-gray-700 mt-3">
          Adopté par l'assemblée générale du 20/01/2024
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Article 1 – Adhésion à l'association
          </h4>
          <p className="text-gray-700 leading-relaxed">
            Pour devenir membre de l'association et pouvoir utiliser
            l'application e-changes.com, il faut être un être humain majeur et
            adhérer au projet de l'association à savoir (article 1 des Statuts)
            :
          </p>
          <blockquote className="border-l-4 border-teal-500 pl-4 my-3 italic text-gray-700">
            « faciliter, à titre gracieux, les libres échanges de services, de
            trocs de biens, à l'exception de tout produit et service prohibé, en
            bonne intelligence – c'est-à-dire des échanges bienveillants,
            paisibles et responsables, entre les membres de cette association ou
            des associations adhérentes. »
          </blockquote>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Article 2 - Adhésion à la philosophie de l'application e-changes.com
          </h4>
          <p className="text-gray-700 leading-relaxed">
            Tout membre de l'association souhaitant utiliser l'application
            e-changes.com pour réaliser ses échanges de biens et/ou services
            avec d'autres membres doit confirmer son choix de se conformer aux
            nouvelles règles d'échanges : la valeur utilisée pour formaliser les
            échanges est de l'énergie - e-nergie (e).
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Article 3 – E-changes de talents et de biens : Modalités pour
            générer des e-nergies (e)
          </h4>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-teal-600">• Être adhérant :</strong>{" "}
                Tout membre adhérant à l'association s'acquitte annuellement
                d'une cotisation de 20€ qui lui donne droit automatiquement à
                33e. Un membre peut choisir à partir de sa deuxième adhésion de
                devenir un membre bienfaiteur et donner un montant libre qui
                sera transformé en e sur la base de la conversion 20€/33e.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-teal-600">• Être e-changeur :</strong>{" "}
                Tout échange de biens et/ou de services donne lieu à un
                transfert d'e d'un e- changeur à l'autre, après validation par
                les deux du service rendu ou du bien délivré, du délai et du
                montant d'e ainsi généré.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-teal-600">• Être parrain :</strong> Tout
                nouveau membre doit être parrainé et indiquer le code de la
                personne qui l'a parrainé. Tout parrainage génère de l'e dont la
                quantité diffère en fonction du nombre de personnes parrainées.
                Parrainer jusqu'à 100 personnes et gagner 33e/pers, à partir de
                101 – 12e/pers.
              </p>
            </div>

            <p className="text-sm text-gray-600 italic">
              Des campagnes ponctuelles peuvent être menées et générer des e à
              la hausse sur une période déterminée tant pour l'adhésion que pour
              les parrainages.
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Article 4 – E-changes en toute confiance
          </h4>
          <p className="text-gray-700 leading-relaxed">
            Pour que tout échange se déroule en toute transparence et confiance,
            tout membre doit se conformer aux règles d'authentification lors de
            la création de leur profil.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Article 5 – E-changes en bonne intelligence
          </h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold text-gray-800 mb-2">
                Des e-changes bienveillants et paisibles :
              </h5>
              <p className="text-gray-700 leading-relaxed mb-3">
                Les membres de l'association et utilisateurs de l'application
                échangent entre eux avec bienveillance et paisiblement – les
                deux e-changeurs doivent être majeurs et d'accord sur le service
                rendu ou le bien à délivrer, la date à laquelle le service sera
                effectué ou le bien sera livré et la quantité d'e-nergie (e) que
                l'un recevra et l'autre donnera pour l'échange. Les discussions
                doivent rester polies et correctes même si l'échange ne devait
                finalement pas se conclure.
              </p>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-gray-700 leading-relaxed">
                  Toute violence ou insulte peut faire l'objet d'un signalement.
                  Tout signalement exclut temporairement, pour un mois, l'auteur
                  des insultes ou violences (si elles ne relèvent pas d'une
                  qualification pénale). Tout comportement similaire du même
                  auteur après la fin de la période d'exclusion conduit à sa
                  radiation de l'association et l'impossibilité d'utiliser
                  l'application.
                </p>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">
                Des e-changes responsables :
              </h5>
              <p className="text-gray-700 leading-relaxed mb-3">
                Les membres de l'association et utilisateurs de l'application
                s'engagent à tenir leurs engagements – réaliser le service et
                dans de bonne condition, livrer le bien indiqué en bon état,
                etc. En cas de non-respect des engagements pris, l'e-changeur
                qui n'a pas reçu le service ou le bien doit faire un signalement
                (l'échange d'e-nergie (e) se fait automatiquement après la
                double validation des deux parties – avant et après la
                réalisation du service ou livraison du bien).
              </p>
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                <p className="text-gray-700 leading-relaxed">
                  Tout signalement exclut temporairement, pour un mois,
                  l'e-changeur qui n'a pas respecté son engagement. Tout
                  comportement similaire du même auteur après la fin de la
                  période d'exclusion conduit à sa radiation de l'association et
                  l'impossibilité d'utiliser l'application.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 italic mt-4">
            Les autres cas de démission et décès d'un membre, sont réglés à
            l'article 8 - radiations des statuts de l'association. La cotisation
            versée à l'association est définitivement acquise, même cas en cas
            de démission, de radiation, ou de décès d'un membre en cours
            d'année.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Article 6 – E-changes sur la vie de l'association
          </h4>
          <div className="space-y-3">
            <p className="text-gray-700 leading-relaxed">
              Tous les membres sont invités à prendre la parole sur la vie de
              l'association et de faire des propositions.
            </p>
            <p className="text-gray-700 leading-relaxed">
              L'assemblée générale ordinaire comprend tous les membres de
              l'association à quelque titre qu'ils soient et conformément à
              l'article 5 – composition des statuts. Elle se réunit chaque année
              au mois de mars.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Sont abordés les points inscrits à l'ordre du jour. Peuvent être
              ajoutés des sujets à condition que la demande soit faite au tout
              début de la réunion et l'ajout approuvé par la majorité des
              personnes participantes, avant d'aborder les points déjà inscrits
              à l'ordre du jour et seront discutés à l'issue de ceux-là.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Les décisions sont prises à la majorité des voix des membres
              présents ou représentés. Doivent être présents ou représentés un
              tiers des membres de l'assemblée collégiale et un tiers des
              membres de l'association.
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Article 7 – E-change de règlement intérieur
          </h4>
          <p className="text-gray-700 leading-relaxed">
            Le présent règlement intérieur pourra être modifié par le bureau ou
            par l'assemblée générale ordinaire à la majorité simple des membres.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <form className="p-6 space-y-4" onSubmit={handleRegistrationNext}>
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <p className="text-sm text-center font-medium text-gray-700 mb-4">
          Afin de continuer, veuillez lire et accepter le règlement intérieur
        </p>

        <div
          className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 h-64 overflow-y-auto border cursor-pointer hover:bg-gray-100 transition-colors relative"
          onClick={() => setShowFullDocument(true)}
        >
          <div className="absolute top-2 right-2 bg-teal-500 text-white px-2 py-1 rounded text-xs">
            <ImEnlarge2 />
          </div>

          <div className="space-y-4 pr-4">
            <div className="text-center">
              <h3 className="font-bold text-base mb-2">
                Règlement intérieur de l'association E-changes
              </h3>
              <p className="text-sm italic">
                pour faciliter les échanges et les partages entre les membres de
                l'association
              </p>
              <p className="text-sm italic">
                via la bonne utilisation de l'application e-changes.com
              </p>
              <p className="text-xs font-medium mt-2">
                Adopté par l'assemblée générale du 20/01/2024
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                Article 1 – Adhésion à l'association
              </h4>
              <p>
                Pour devenir membre de l'association et pouvoir utiliser
                l'application e-changes.com, il faut être un être humain majeur
                et adhérer au projet de l'association...
              </p>
            </div>

            <div className="text-center text-gray-500 text-sm font-medium">
              ... Cliquez pour lire l'intégralité du document ...
            </div>
          </div>
        </div>

        <div className="flex items-center mt-4">
          <input
            id="accept-terms"
            name="accept-terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="h-4 w-4 text-teal-500 focus:ring-teal-400 border-gray-300 rounded"
          />
          <label
            htmlFor="accept-terms"
            className="ml-2 block text-sm text-gray-700"
          >
            J'accepte le règlement intérieur
          </label>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={handleRegistrationBack}
            className="py-2 px-4 text-sm font-medium text-gray-700 focus:outline-none"
          >
            RETOUR
          </button>
          <button
            type="submit"
            className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            CONTINUER <span className="ml-2">→</span>
          </button>
        </div>

        <div className="text-center text-sm mt-4">
          <p>
            Déjà un compte ?{" "}
            <a
              href="#"
              className="font-medium text-teal-500 hover:text-teal-400 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("login");
              }}
            >
              Connectez-vous
            </a>
          </p>
        </div>
      </form>

      {/* Full Document Modal */}
      {showFullDocument && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Règlement Intérieur - Association E-changes
              </h2>
              <button
                onClick={() => setShowFullDocument(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">
                <ReglementContent />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t p-6 bg-gray-50 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="accept-terms-modal"
                    name="accept-terms-modal"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 text-teal-500 focus:ring-teal-400 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="accept-terms-modal"
                    className="ml-2 block text-sm text-gray-700 font-medium"
                  >
                    J'accepte le règlement intérieur
                  </label>
                </div>
                <button
                  onClick={() => setShowFullDocument(false)}
                  className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RegistrationStep2;
