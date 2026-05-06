import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBox } from "@/components/shared/icon-box";
import { PageTitle } from "@/components/shared/page-title";
import { MutedText } from "@/components/shared/muted-text";
import { TextCaption } from "@/components/shared/text-caption";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VStack } from "@/components/shared/VStack";
import { LoginLayout } from "@/components/layout/login-layout";

function BrandBlock() {
  return (
    <VStack gap="md" align="center">
      <IconBox icon={BriefcaseBusiness} size="md" variant="primary" />
      <PageTitle>BigDil</PageTitle>
      <MutedText spacing="tight">Professional Services Automation</MutedText>
    </VStack>
  );
}

function FormField({
  htmlFor,
  label,
  children,
}: {
  htmlFor: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <VStack gap="sm">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </VStack>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    toast.success("Login successful — redirecting...");
    setTimeout(() => {
      navigate("/projects");
    }, 800);
  }

  return (
    <LoginLayout>
      <BrandBlock />

      {/* Form card */}
      <Card variant="compact">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your credentials to access your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <VStack gap="xl">
              <FormField htmlFor="email" label="Email">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@acme-consulting.fr"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>
              <FormField htmlFor="password" label="Password">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormField>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </VStack>
          </form>
        </CardContent>
      </Card>

      <TextCaption center>
        &copy; {new Date().getFullYear()} BigDil. All rights reserved.
      </TextCaption>
    </LoginLayout>
  );
}
