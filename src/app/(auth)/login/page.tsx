'use client';

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition } from 'react';
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { handleGoogleUser } from "../actions";
import { Loader2 } from "lucide-react";


const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginValues) => {
    startTransition(async () => {
      if (!auth) {
        toast({ title: "Login Failed", description: "Firebase not configured.", variant: "destructive" });
        return;
      }
      try {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push("/explore");
      } catch (error: any) {
        const errorMessage = error.code ? error.code.replace('auth/', '').replace(/-/g, ' ') : error.message;
        toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
      }
    });
  };

  const handleGoogleLogin = () => {
    startTransition(async () => {
      if (!auth) {
        toast({ title: "Login Failed", description: "Firebase not configured.", variant: "destructive" });
        return;
      }
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const { user } = result;

        const dbResult = await handleGoogleUser({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL
        });

        if (dbResult.error) {
            throw new Error(dbResult.error);
        }

        toast({ title: "Login Successful", description: "Welcome!" });
        router.push("/explore");

      } catch (error: any) {
        const errorMessage = error.code ? error.code.replace('auth/', '').replace(/-/g, ' ') : error.message;
        toast({ title: "Google Login Failed", description: errorMessage, variant: "destructive" });
      }
    });
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <Link href="#" className="ml-auto inline-block text-sm underline">
                        Forgot your password?
                        </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                Login
              </Button>
            </form>
          </Form>
           <Button variant="outline" className="w-full mt-4" onClick={handleGoogleLogin} disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : 'Continue with Google'}
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
