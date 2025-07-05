import { Button } from "@/components/ui/button";

export default function LoginButton() {
  return (
    <Button
      variant="ghost"
      className="text-white border border-white/20 bg-black/30 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-all"
    >
      Log in
    </Button>
  );
}
