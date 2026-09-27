import CarDetails from "@/components/cars/CarDetails";

type CarDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CarDetailsPage({
  params,
}: CarDetailsPageProps) {
  const { slug } = await params;

  return <CarDetails slug={slug} />;
}