import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">IBA</CardTitle>
        <CardDescription>
          Inicie sessão para aceder à sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
            Criar conta
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
