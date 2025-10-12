/**
 * Engineering Mode Page
 * Main interface for generating technical diagrams
 */

import { getServerAuthSession } from "@/auth";
import { redirect } from "next/navigation";
import EngineeringModeClient from "./client";

export default async function EngineeringModePage() {
  const session = await getServerAuthSession();
  
  if (!session?.user?.email) {
    redirect("/sign-in");
  }

  return <EngineeringModeClient userEmail={session.user.email} />;
}
