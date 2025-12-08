import { Metadata } from "next";
import LandingPageClient from "./LandingPageClient";

export const metadata: Metadata = {
  title: "TownApp - Discover Your Town in Real Time",
  description:
    "Real-time updates, local events, weather, road conditions, and more. Your complete town companion for Stykkishólmur, Iceland.",
};

export default function LandingPage() {
  return <LandingPageClient />;
}
