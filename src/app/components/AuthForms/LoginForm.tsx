// LoginForm.tsx
import React from "react";

interface LoginFormProps {
  loginEmail: string;
  setLoginEmail: (email: string) => void;
  loginPassword: string;
  setLoginPassword: (password: string) => void;
  handleLoginSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string;
  setActiveTab: (tab: string) => void;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  handleLoginSubmit,
  isLoading,
  error,
  setActiveTab,
  rememberMe,
  setRememberMe,
}) => {
  return (
    <form className="p-6 space-y-4" onSubmit={handleLoginSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="email-address"
          className="block text-sm font-medium text-gray-700"
        >
          ADRESSE E-MAIL*
        </label>
        <input
          id="email-address"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          placeholder="nom@exemple.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          MOT DE PASSE*
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          placeholder="Mot de passe"
        />
        <div className="text-right mt-1">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("forgot-password");
            }}
            className="text-sm text-teal-500 hover:text-teal-400"
          >
            Mot de passe oublié ?
          </a>
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 text-teal-500 focus:ring-teal-400 border-gray-300 rounded"
        />
        <label
          htmlFor="remember-me"
          className="ml-2 block text-sm text-gray-700"
        >
          Se souvenir de moi
        </label>
      </div>

      <div className="flex items-center justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          {isLoading ? (
            "Connexion en cours..."
          ) : (
            <>
              CONNEXION <span className="ml-2">→</span>
            </>
          )}
        </button>
      </div>

      <div className="text-center text-sm mt-4">
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
    </form>
  );
};

export default LoginForm;
