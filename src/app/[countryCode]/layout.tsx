import Nav from "@modules/layout/templates/nav"

export default function CountryCodeLayout(props: {
  children: React.ReactNode
}) {
  return (
    <>
      <Nav />
      {props.children}
    </>
  )
}
