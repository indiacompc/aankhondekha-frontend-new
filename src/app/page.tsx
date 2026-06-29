import HomeClient from "./HomeClient";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title:
    "Aankhon Dekha - MP VR Center | Madhya Pradesh Virtual Reality Experience",
  description:
    "Experience Madhya Pradesh's rich heritage through immersive VR technology at Aankhon Dekha. Visit our centers in Bhopal and Orchha for an unforgettable journey through history.",
  keywords:
    "MP VR center, Madhya Pradesh VR, Bhopal VR center, Orchha VR center, MP heritage VR, Madhya Pradesh virtual reality, MP tourism VR, Indian heritage VR, Sanchi VR, Mandu VR, virtual reality Madhya Pradesh, VR tourism MP, MP cultural heritage",
  path: "/",
});

export default function Page() {
  return <HomeClient />;
}
