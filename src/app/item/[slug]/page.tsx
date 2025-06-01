
import type { Metadata } from 'next';
import { getProduceByCommonName, getProduceGuide } from '@/lib/produceData';
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
  
  // Ensure image URL is absolute if it's relative, or use as is if absolute
  const imageUrl = produce.image.startsWith('http') ? produce.image : `${siteBaseUrl}${produce.image}`;


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
          url: imageUrl,
          width: 600, // Adjust if your placeholders have different default sizes
          height: 400, // Adjust
          alt: produce.commonName,
          'data-ai-hint': imageHint,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${produce.commonName} - AgriPedia`,
      description: produce.description.substring(0, 160),
      images: [imageUrl],
      // creator: '@YourTwitterHandle', // Optional: add your Twitter handle
    },
  };
}

export default function ItemPageWrapper({ params }: { params: { slug: string } }) {
  const decodedSlug = decodeURIComponent(params.slug);
  const produce = getProduceByCommonName(decodedSlug);

  if (!produce) {
    notFound();
  }

  // Assuming produce.id can be used to form the plant_id for the guide.
  // e.g., if produce.id is "basil", plant_id is "basil_001".
  // This logic needs to be robust. For now, we'll make a simple assumption.
  // A better way would be to have `plant_guide_id` field in the produce JSON data.
  // Let's assume a convention: if produce.id is 'basil', guide ID is 'basil_001'.
  // This is a temporary measure for this step.
  const plantGuideId = produce.id ? `${produce.id}_001` : null;
  const growingGuideData = plantGuideId ? getProduceGuide(plantGuideId) : null;

  // Pass both produce and growingGuideData to the client component
  return <ItemDetailsPage slugFromParams={params.slug} initialProduce={produce} initialGrowingGuide={growingGuideData} />;
}
