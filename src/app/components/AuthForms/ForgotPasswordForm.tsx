// ForgotPasswordForm.tsx
import React from "react";

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string;
  success: boolean;
  setActiveTab: (tab: string) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  email,
  setEmail,
  handleSubmit,
  isLoading,
  error,
  success,
  setActiveTab,
}) => {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Mot de passe oublié ?
        </h2>
        <p className="text-sm text-gray-600">
          Saisissez votre adresse e-mail et nous vous enverrons un lien pour
          réinitialiser votre mot de passe.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success ? (
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
          <div className="text-center space-y-3">
            <div className="text-4xl">📧</div>
            <h3 className="font-medium">E-mail envoyé !</h3>
            <p className="text-sm">
              Un lien de réinitialisation a été envoyé à{" "}
              <strong>{email}</strong>. Vérifiez votre boîte de réception et
              suivez les instructions.
            </p>
            <p className="text-xs text-green-600">
              Vous ne trouvez pas l'e-mail ? Vérifiez vos spams.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reset-email"
              className="block text-sm font-medium text-gray-700"
            >
              ADRESSE E-MAIL*
            </label>
            <input
              id="reset-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="nom@exemple.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              "Envoi en cours..."
            ) : (
              <>
                ENVOYER LE LIEN <span className="ml-2">→</span>
              </>
            )}
          </button>
        </form>
      )}

      <div className="text-center text-sm space-y-2">
        <p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("login");
            }}
            className="font-medium text-teal-500 hover:text-teal-400"
          >
            ← Retour à la connexion
          </a>
        </p>
        <p>
          Pas encore de compte ?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("register");
            }}
            className="font-medium text-teal-500 hover:text-teal-400"
          >
            Inscrivez-vous
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
