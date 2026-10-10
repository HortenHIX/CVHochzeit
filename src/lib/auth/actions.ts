'use server';

import { redirect } from 'next/navigation';
import { endSession } from './session';

/** Abmelden (Gäste und Admin). Als Formular-Aktion verwenden: <form action={logout}>. */
export async function logout(): Promise<void> {
  await endSession();
  redirect('/login');
}
