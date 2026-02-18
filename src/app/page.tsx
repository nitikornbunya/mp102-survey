import HomeClient from "./HomeClient";

function getEditProfile(value: string | string[] | undefined): boolean {
  if (value === undefined) return false;
  const v = Array.isArray(value) ? value[0] : value;
  return v === "1";
}

type SearchParams = { [key: string]: string | string[] | undefined };
type PageProps = {
  searchParams: Promise<SearchParams> | SearchParams;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams);
  const editProfile = getEditProfile(params.editProfile);
  return <HomeClient editProfile={editProfile} />;
}
