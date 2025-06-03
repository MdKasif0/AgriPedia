import type { Metadata } from 'next';
import { getProduceByCommonName } from '@/lib/produceData';
import ItemDetailsPage from './item-details-page';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const produce = getProduceByCommonName(slug);
  const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (!produce) {
    return {
      title: 'Produce Not Found - AgriPedia',
      description: 'The requested fruit or vegetable could not be found.',
    };
  }

  const commonNameWords = produce.commonName.toLowerCase().split(' ');
  const imageHint = commonNameWords.length > 1 ? commonNameWords.slice(0, 2).join(' ') : commonNameWords[0];
  
  const imageUrl = produce.image.startsWith('http') ? produce.image : `${siteBaseUrl}${produce.image}`;

  return {
    title: `${produce.commonName} - AgriPedia`,
    description: produce.description.substring(0, 160),
    openGraph: {
      title: `${produce.commonName} - AgriPedia`,
      description: produce.description.substring(0, 160),
      url: `${siteBaseUrl}/item/${encodeURIComponent(slug)}`,
      siteName: 'AgriPedia',
      images: [
        {
          url: imageUrl,
          width: 600,
          height: 400,
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
    },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const produce = getProduceByCommonName(decodeURIComponent(params.slug));
  if (!produce) {
    notFound();
  }
  return <ItemDetailsPage slugFromParams={params.slug} />;
}
