
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  isLoading: boolean;
}

const LoginForm = ({ onLogin, isLoading }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateForm = () => {
    let isValid = true;
    
    if (!email) {
      setEmailError("E-Mail darf nicht leer sein.");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Ungültige E-Mail.");
      isValid = false;
    } else {
      setEmailError("");
    }
    
    if (!password) {
      setPasswordError("Passwort darf nicht leer sein.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Passwort muss mindestens 6 Zeichen lang sein.");
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onLogin(email, password);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement password recovery
    alert("Das Zurücksetzen von Passwörtern ist noch nicht implementiert.");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="ich@beispiel.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={emailError ? "border-red-500" : ""}
          />
          {emailError && (
            <p className="text-sm text-red-500">{emailError}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password">Passwort</Label>
            <button
              type="button"
              className="text-sm text-primary-blue hover:underline"
              onClick={handleForgotPassword}
            >
              Passwort vergessen?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={passwordError ? "border-red-500" : ""}
          />
          {passwordError && (
            <p className="text-sm text-red-500">{passwordError}</p>
          )}
        </div>
        
        <Button
          type="submit"
          className="w-full bg-primary-blue hover:bg-primary-dark"
          disabled={isLoading}
        >
          {isLoading ? "Lade..." : "Anmelden"}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
