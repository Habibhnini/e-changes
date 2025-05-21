"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  MouseEvent,
} from "react";
import Image from "next/image";

//
// ─── AUTH HELPERS ──────────────────────────────────────────────────────────────
//
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

async function authenticateMercure(
  transactionId: string
): Promise<string | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/mercure/auth?transaction=${transactionId}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(), // Bearer <app-jwt> etc.
    });

    if (!response.ok) {
      throw new Error(`Mercure auth failed: ${response.status}`);
    }
    const data = await response.json();
    return data.token as string;
  } catch (err) {
    setError("Authentication failed: " + (err as Error).message);
    return null;
  }
}

//
// ─── TYPES ────────────────────────────────────────────────────────────────────
//
interface Offer {
  id: string;
  amount: number;
  status: "pending" | "accepted" | "rejected";
  buyerAccepted: boolean;
  vendorAccepted: boolean;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    isYou: boolean;
  };
}

interface TransactionDetailsProps {
  transactionId: string | null;
  service: any;
  transaction: any;
  otherUser: any;
  currentUser: any;
  onSendMessage: (content: string) => Promise<void>;
  screenSize: { width: number; height: number };
  formatMessageDate: (dateString: string) => string;
  formatTransactionStatus: (status: string) => string;
  onUpdateTransaction?: (updatedTransaction: any) => void;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transactionId,
  service,
  transaction,
  otherUser,
  currentUser,
  onSendMessage,
  screenSize,
  formatMessageDate,
  formatTransactionStatus,
  onUpdateTransaction,
}) => {
  // ────────────────────────────────────────────────────────────────────────────
  // STATE / REFS
  // ────────────────────────────────────────────────────────────────────────────
  const [negotiationHistory, setNegotiationHistory] = useState<Offer[]>([]);
  const [offerAmount, setOfferAmount] = useState("");
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [showCounterForm, setShowCounterForm] = useState<string | null>(null);
  const [counterOfferAmount, setCounterOfferAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const counterOfferRef = useRef<HTMLDivElement>(null);

  const isMobile = screenSize.width < 768;
  const isTablet = screenSize.width >= 768 && screenSize.width < 1024;
  const isNarrowDesktop = screenSize.width >= 1024 && screenSize.width < 1290;

  // ────────────────────────────────────────────────────────────────────────────
  // CLOSE COUNTER FORM ON OUTSIDE CLICK
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        counterOfferRef.current &&
        !counterOfferRef.current.contains(event.target as Node)
      ) {
        setShowCounterForm(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // 1) INITIAL LOAD OF ALL OFFERS ON MOUNT / transactionId CHANGE
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!transactionId) return;
    (async () => {
      try {
        const res = await fetch(`/api/transactions/${transactionId}/offers`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error(res.statusText);

        const { offers } = await res.json();
        setNegotiationHistory(
          offers.map((o: any) => ({
            ...o,
            sender: {
              ...o.sender,
              isYou: o.sender.id === currentUser?.id,
            },
          }))
        );
      } catch (e) {
        //console.error("Failed to load offers:", e);
        setError("Impossible de charger les offres");
      }
    })();
  }, [transactionId, currentUser]);

  // ────────────────────────────────────────────────────────────────────────────
  // 2) SSE SUBSCRIPTION FOR REAL-TIME “offers” EVENTS
  // ────────────────────────────────────────────────────────────────────────────
  // Inside TransactionDetails.tsx

  useEffect(() => {
    if (!transactionId) return;
    let es: EventSource;

    (async () => {
      const token = await authenticateMercure(transactionId);
      if (!token) return;

      const url = new URL("/api/mercure/proxy", window.location.origin);
      url.searchParams.append(
        "topic",
        `chat/transaction/${transactionId}/offers`
      );
      url.searchParams.append("authorization", token);

      es = new EventSource(url.toString());

      es.onopen = () =>
        //console.log("✅ Offers SSE connected");
        (es.onerror = (
          err // console.error("⚠️ Offers SSE error", err);
        ) =>
          // Inside your useEffect SSE handler, replace the new_offer branch with:

          (es.onmessage = (evt) => {
            const data = JSON.parse(evt.data);
            const raw = data.offer as any;

            // 1) If it's your own offer, skip it entirely
            if (
              data.type === "new_offer" &&
              raw.sender.id === currentUser?.id
            ) {
              return;
            }

            setNegotiationHistory((prev) => {
              // NEW OFFER from the other side
              if (data.type === "new_offer") {
                if (prev.some((o) => o.id === raw.id)) return prev;
                return [
                  ...prev,
                  { ...raw, sender: { ...raw.sender, isYou: false } },
                ];
              }

              // ACCEPT / REJECT as before...
              if (
                data.type === "offer_accepted" ||
                data.type === "offer_rejected"
              ) {
                return prev.map((o) =>
                  o.id === raw.id
                    ? {
                        ...raw,
                        status:
                          data.type === "offer_accepted"
                            ? "accepted"
                            : "rejected",
                        sender: {
                          ...raw.sender,
                          isYou: raw.sender.id === currentUser?.id,
                        },
                      }
                    : o
                );
              }

              return prev;
            });
          }));
    })();

    return () => {
      if (es) es.close();
    };
  }, [transactionId, currentUser]);

  // ────────────────────────────────────────────────────────────────────────────
  // HANDLERS: MAKE, RESPOND, COUNTER
  // ────────────────────────────────────────────────────────────────────────────
  const handleMakeOffer = useCallback(async () => {
    if (!offerAmount || isNaN(+offerAmount) || +offerAmount <= 0) {
      setError("Veuillez saisir un montant valide");
      return;
    }
    setIsSubmittingOffer(true);

    const tempId = `temp-${Date.now()}`;
    const tempOffer: Offer = {
      id: tempId,
      amount: +offerAmount,
      status: "pending",
      buyerAccepted: false,
      vendorAccepted: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        isYou: true,
      },
    };
    setNegotiationHistory((p) => [...p, tempOffer]);
    setOfferAmount("");

    try {
      const res = await fetch(`/api/transactions/${transactionId}/offers`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: +offerAmount }),
      });
      if (!res.ok) throw new Error("Failed to send offer");

      const { offer } = await res.json();
      setNegotiationHistory((p) =>
        p.map((o) =>
          o.id === tempId
            ? {
                ...offer,
                sender: { ...offer.sender, isYou: true },
              }
            : o
        )
      );
      await onSendMessage(
        `J'ai proposé un nouveau prix de ${offerAmount} energy.`
      );
    } catch {
      setNegotiationHistory((p) => p.filter((o) => o.id !== tempId));
      setError("Échec de l'envoi de l'offre");
    } finally {
      setIsSubmittingOffer(false);
    }
  }, [offerAmount, transactionId, currentUser, onSendMessage]);

  const handleOfferResponse = useCallback(
    async (offerId: string, action: "accept" | "reject") => {
      try {
        const res = await fetch(
          `/api/transactions/${transactionId}/offers/${offerId}/${action}`,
          { method: "POST", headers: getAuthHeaders() }
        );
        if (!res.ok) throw new Error();

        const { offer } = await res.json();
        setNegotiationHistory((p) =>
          p.map((o) =>
            o.id === offerId
              ? { ...offer, sender: { ...offer.sender, isYou: o.sender.isYou } }
              : o
          )
        );

        const original = negotiationHistory.find((o) => o.id === offerId);
        const msg =
          action === "accept"
            ? `J'ai accepté le prix de ${original?.amount} energy.`
            : `J'ai refusé le prix de ${original?.amount} energy.`;
        await onSendMessage(msg);

        if (action === "accept" && original && onUpdateTransaction) {
          onUpdateTransaction({
            ...transaction,
            energyAmount: original.amount,
          });
        }
      } catch {
        setError(
          action === "accept"
            ? "Échec de l'acceptation de l'offre"
            : "Échec du refus de l'offre"
        );
      }
    },
    [
      transactionId,
      negotiationHistory,
      onSendMessage,
      transaction,
      onUpdateTransaction,
    ]
  );

  const handleCounterOffer = useCallback(
    async (offerId: string, amount: string) => {
      if (!amount || isNaN(+amount) || +amount <= 0) {
        setError("Montant invalide pour la contre-offre");
        return;
      }
      await handleOfferResponse(offerId, "reject");
      setOfferAmount(amount);
      await handleMakeOffer();
    },
    [handleOfferResponse, handleMakeOffer]
  );

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────
  if (!transaction || !service) {
    return (
      <div className="p-4 text-gray-500 text-center">
        Aucun détail disponible
      </div>
    );
  }
  return (
    <div className="p-4">
      {!isMobile && !isTablet && (
        <h2 className="font-medium text-lg mb-3">À propos de cet échange</h2>
      )}

      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-800 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Transaction Status */}
      <div className="mb-4 p-3 rounded-lg border border-gray-200">
        <div className="font-medium mb-2">Statut de la transaction</div>
        <div
          className={`text-sm font-medium ${
            transaction.status === "created"
              ? "text-blue-500"
              : transaction.status === "negotiation"
              ? "text-purple-500"
              : transaction.status === "success"
              ? "text-green-500"
              : transaction.status === "delivery"
              ? "text-orange-500"
              : transaction.status === "validation"
              ? "text-yellow-500"
              : transaction.status === "completed"
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {formatTransactionStatus(transaction.status)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Créée le {formatMessageDate(transaction.createdAt)}
        </div>
        <div className="text-sm mt-2">
          <span className="text-gray-600">Montant:</span>{" "}
          {transaction.energyAmount}
          <Image
            src="/coin.png"
            alt="Energy"
            width={20}
            height={20}
            className="inline-block ml-1 h-4 w-4"
          />
        </div>
      </div>

      {/* Price Negotiation Section */}
      <div className="mb-4 p-3 rounded-lg border border-gray-200">
        <div className="font-medium mb-2">Négociation du prix</div>

        {/* Current price */}
        <div className="text-sm mb-3">
          <span className="text-gray-600">Prix actuel:</span>{" "}
          <span className="font-medium">
            {transaction.energyAmount}
            <Image
              src="/coin.png"
              alt="Energy"
              width={20}
              height={20}
              className="inline-block ml-1 h-4 w-4"
            />
          </span>
        </div>

        {/* Price negotiation status */}
        {negotiationHistory.some((offer) => offer.status === "accepted") ? (
          <div className="p-2 bg-green-50 rounded-lg border border-green-200 text-sm text-green-700 mb-3">
            ✓ Prix finalisé et accepté
          </div>
        ) : (
          <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-700 mb-3">
            ⚠️ Négociation en cours
          </div>
        )}

        {/* Negotiation history */}
        {negotiationHistory.length > 0 && (
          <div className="mb-3">
            <div className="text-sm font-medium mb-2">
              Historique des offres
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {negotiationHistory.map((offer) => (
                <div
                  key={offer.id}
                  className={`p-2 rounded text-sm ${
                    offer.status === "accepted"
                      ? "bg-green-50 border border-green-200"
                      : offer.status === "rejected"
                      ? "bg-red-50 border border-red-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span
                        className={
                          offer.sender.isYou ? "text-teal-600 font-medium" : ""
                        }
                      >
                        {offer.sender.isYou ? "Vous" : offer.sender.name}
                      </span>{" "}
                      avez proposé{" "}
                      <span className="font-medium">{offer.amount}</span>
                      <Image
                        src="/coin.png"
                        alt="Energy"
                        width={16}
                        height={16}
                        className="inline-block ml-1 h-3 w-3"
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatMessageDate(offer.createdAt).split(",")[0]}
                    </div>
                  </div>

                  {/* Status indicator and actions */}
                  <div className="mt-1 flex justify-between items-center">
                    <div>
                      {offer.status === "pending" && !offer.sender.isYou && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleOfferResponse(offer.id, "accept")
                            }
                            className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs hover:bg-green-200"
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() =>
                              handleOfferResponse(offer.id, "reject")
                            }
                            className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs hover:bg-red-200"
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                      {offer.status === "accepted" && (
                        <span className="text-green-600 text-xs">
                          Accepté ✓
                        </span>
                      )}
                      {offer.status === "rejected" && (
                        <span className="text-red-600 text-xs">Refusé ✗</span>
                      )}
                      {offer.status === "pending" && offer.sender.isYou && (
                        <span className="text-gray-600 text-xs">
                          En attente...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Make new offer - only show if no offer has been accepted and transaction is in an appropriate state */}
        {!negotiationHistory.some((offer) => offer.status === "accepted") &&
          ["created", "negotiation"].includes(transaction.status) && (
            <div className="mt-3">
              <div className="text-sm font-medium mb-2">
                Faire une nouvelle offre
              </div>
              <div className="flex">
                <div className="relative flex-1 mr-2">
                  <input
                    type="number"
                    placeholder="Montant"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    min="1"
                    disabled={isSubmittingOffer}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Image
                      src="/coin.png"
                      alt="Energy"
                      width={16}
                      height={16}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
                <button
                  onClick={handleMakeOffer}
                  className={`px-3 py-2 ${
                    isSubmittingOffer
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#38AC8E] hover:bg-teal-600"
                  } text-white rounded-lg text-sm transition-colors`}
                  disabled={isSubmittingOffer}
                >
                  {isSubmittingOffer ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Proposer"
                  )}
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Service Information */}
      <div className="mb-4">
        <h3 className="font-medium">{service.title}</h3>
        <p className="text-[15px] text-gray-400 mt-1">
          {service.fullDescription}
        </p>
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex justify-between">
          <span className="text-[15px] text-gray-600">Localisation</span>
          <span className="text-[15px] font-medium">
            {service.details?.location || "Non spécifié"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[15px] text-gray-600">Durée</span>
          <span className="text-[15px] font-medium">
            {service.details?.duration || "Non spécifié"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[15px] text-gray-600">Prix </span>
          <span className="text-[15px] font-medium">
            {" "}
            {transaction.energyAmount}
          </span>
        </div>
      </div>

      <div className="mt-6 border-t pt-4 border-gray-300">
        <div
          className={`flex ${isNarrowDesktop ? "flex-col" : "flex-row"} gap-2 ${
            isNarrowDesktop ? "" : "justify-center"
          }`}
        >
          <button
            className={`px-4 py-2 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors cursor-pointer ${
              isNarrowDesktop ? "w-full" : ""
            }`}
          >
            Signaler
          </button>
          <button
            className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors cursor-pointer ${
              isNarrowDesktop ? "w-full" : ""
            }`}
          >
            Annuler
          </button>
          <button
            className={`px-4 py-2 bg-[#38AC8E] text-white rounded-lg text-sm hover:bg-teal-600 transition-colors cursor-pointer ${
              isNarrowDesktop ? "w-full" : ""
            }`}
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
function setError(arg0: string) {
  throw new Error("Function not implemented.");
}
