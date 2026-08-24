import { pageMetadata } from "@/lib/seo";
import LocationClient from "./LocationClient";

/**
 * Server wrapper so this route can export metadata.
 *
 * /location is the public entry point to booking — every "Book Now" on the home
 * page routes here — but it was a "use client" component, which cannot export
 * metadata. It therefore inherited the generic site-wide title and description
 * from the root layout, identical to the home page's. Same server/client split
 * already used by app/page.tsx + HomeClient.tsx.
 */
export const metadata = pageMetadata({
  title: "Book VR Tickets - Bhopal, Orchha & Maheshwar Centres",
  description:
    "Book your Aankhon Dekha VR experience. Choose a centre — Bhopal State Museum, MPT Boat Club Bhopal, Orchha Fort Complex or Maheshwar — then pick your date and time slot.",
  keywords:
    "book VR tickets Madhya Pradesh, Aankhon Dekha booking, Bhopal VR tickets, Orchha VR tickets, Maheshwar VR tickets, State Museum VR booking, VR experience booking MP",
  path: "/location",
});

export default function LocationPage() {
  return <LocationClient />;
}
