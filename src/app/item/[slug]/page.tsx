
import type { Metadata } from 'next';
import { getProduceByCommonName } from '@/lib/produceData';
import ItemDetailsPage from './item-details-page'; // Corrected client component import
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const produce = getProduceByCommonName(slug);
  const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; // Fallback needed

  if (!produce) {
    return {
      title: 'Produce Not Found - AgriPedia',
      description: 'The requested fruit or vegetable could not be found.',
    };
  }

  const commonNameWords = produce.commonName.toLowerCase().split(' ');
  const imageHint = commonNameWords.length > 1 ? commonNameWords.slice(0, 2).join(' ') : commonNameWords[0];
  const imageUrl = produce.image; // This is already a placeholder like https://placehold.co/600x400.png

  return {
    title: `${produce.commonName} - AgriPedia`,
    description: produce.description.substring(0, 160), // Keep description concise
    openGraph: {
      title: `${produce.commonName} - AgriPedia`,
      description: produce.description.substring(0, 160),
      url: `${siteBaseUrl}/item/${encodeURIComponent(slug)}`,
      siteName: 'AgriPedia',
      images: [
        {
          url: imageUrl, // Use the actual image URL from produce data
          width: 600, // Adjust if your placeholders have different default sizes
          height: 400, // Adjust
          alt: produce.commonName,
          'data-ai-hint': imageHint,
        },
      ],
      locale: 'en_US',
      type: 'article', // 'article' or 'product' might be more suitable than 'website' for an item page
    },
    twitter: {
      card: 'summary_large_image',
      title: `${produce.commonName} - AgriPedia`,
      description: produce.description.substring(0, 160),
      images: [imageUrl], // Use the actual image URL
      creator: '@YourTwitterHandle', // Optional: add your Twitter handle
    },
  };
}

export default function ItemPageWrapper({ params }: { params: { slug: string } }) {
  // This Server Component simply passes the slug to the Client Component
  // No client-side hooks or direct localStorage access here.
  const produce = getProduceByCommonName(decodeURIComponent(params.slug));
  if (!produce) {
    notFound();
  }
  return <ItemDetailsPage slugFromParams={params.slug} />;
}
