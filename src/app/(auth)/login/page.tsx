'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  getAdditionalUserInfo,
} from 'firebase/auth';
import { Loader } from '@/components/layout/loader';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, setDoc } from 'firebase/firestore';

export default function LoginPage() {
  const { user, isUserLoading: loading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
      return;
    }

    // Only check for redirect result if the initial user load is complete and there's no user.
    if (!loading && !user) {
      getRedirectResult(auth)
        .then((result) => {
          if (result) {
            // User signed in via redirect.
            // The `onAuthStateChanged` listener will handle the user state update,
            // and the `if (user)` block above will trigger the redirect.
            const additionalInfo = getAdditionalUserInfo(result);
            if (additionalInfo?.isNewUser) {
              const userDocRef = doc(firestore, 'users', result.user.uid);
              // Use a non-blocking write for performance
              setDoc(userDocRef, {
                id: result.user.uid,
                email: result.user.email,
                name: result.user.displayName,
                photoURL: result.user.photoURL,
              }).catch((e) =>
                console.error('Error creating user doc on login:', e)
              );
            }
            // Don't set isProcessingRedirect to false here, because we want to wait for the redirect to dashboard.
          } else {
            // No redirect result, so the user is just visiting the login page.
            setIsProcessingRedirect(false);
          }
        })
        .catch((error) => {
          console.error('Failed to get redirect result', error);
          setIsProcessingRedirect(false);
        });
    }
  }, [user, loading, auth, firestore, router]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  // Show a loader while checking for user or processing a redirect.
  if (loading || isProcessingRedirect) {
    return <Loader fullScreen />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo className="h-16 w-16" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to Trackly</CardTitle>
          <CardDescription>Your daily habit tracking companion.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button onClick={handleLogin} className="w-full" size="lg">
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2C327.3 125.2 290.6 108 248 108c-73.4 0-134.3 59.4-134.3 132.3s60.9 132.3 134.3 132.3c82.7 0 122.5-62.9 126.8-95.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
              Sign in with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
