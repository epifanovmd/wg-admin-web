export interface TwoFactorPromptProps {
  hint?: string;
  onVerify: () => void | Promise<void>;
}
