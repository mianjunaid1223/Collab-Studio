'use client';
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition } from 'react';
import { useRouter } from "next/navigation";

import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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
import { createUserInDb, handleGoogleUser } from "../actions";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";


const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters.").max(20, "Username must be less than 20 characters."),
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { auth } = useAuth();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: SignupValues) => {
    startTransition(async () => {
      if (!auth) {
        toast({ title: "Sign Up Failed", description: "Firebase not configured.", variant: "destructive" });
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const { user } = userCredential;

        const result = await createUserInDb({
          userId: user.uid,
          username: values.username,
          email: values.email,
        });

        if (result.error) {
          throw new Error(result.error);
        }

        toast({ title: "Account Created!", description: "Welcome! You are now logged in." });
        router.push("/explore");

      } catch (error: any) {
        const errorMessage = error.code ? error.code.replace('auth/', '').replace(/-/g, ' ') : error.message;
        toast({ title: "Sign Up Failed", description: errorMessage, variant: "destructive" });
      }
    });
  };

  const handleGoogleLogin = () => {
    startTransition(async () => {
      if (!auth) {
        toast({ title: "Sign Up Failed", description: "Firebase not configured.", variant: "destructive" });
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
        
        toast({ title: "Account Created!", description: "Welcome!" });
        router.push("/explore");

      } catch (error: any) {
        const errorMessage = error.code ? error.code.replace('auth/', '').replace(/-/g, ' ') : error.message;
        toast({ title: "Google Sign Up Failed", description: errorMessage, variant: "destructive" });
      }
    });
  }


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
               <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="PixelPioneer" {...field} disabled={isPending}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} disabled={isPending}/>
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isPending}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                Create an account
              </Button>
            </form>
          </Form>
          <Button variant="outline" className="w-full mt-4" onClick={handleGoogleLogin} disabled={isPending}>
             {isPending ? <Loader2 className="animate-spin" /> : 'Sign up with Google'}
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
