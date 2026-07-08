import App from "@/components/App";
import { getRepoStars } from "@/lib/github/stars";

// Fully static (GitHub Pages): the star count is fetched once at build time and
// baked in; all scouting happens client-side through the viewer's token (App).
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "GitFut Private",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript",
      description:
        "Turn a GitHub profile, private contributions you can see included, into a FIFA-Ultimate-Team-style player card rated out of 99.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default async function Home() {
  const stars = await getRepoStars();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <App stars={stars} />
    </>
  );
}
