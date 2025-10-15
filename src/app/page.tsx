/**
 * Home Page - Redirects to Conversations
 *
 * The main entry point now redirects to the conversations page
 * where users can view and manage their conversation history.
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/conversations');
}
