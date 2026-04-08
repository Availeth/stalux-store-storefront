import { Metadata } from "next"

import StaluxHome from "@modules/home/components/stalux-home"

export const metadata: Metadata = {
  title: "Stalux Automation | Precision Components",
  description:
    "Industrial automation storefront for Stalux precision motion control systems.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  return <StaluxHome countryCode={countryCode} />
}
