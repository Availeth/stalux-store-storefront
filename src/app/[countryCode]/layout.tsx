import Nav from "@modules/layout/templates/nav"
import Footer from "@modules/layout/templates/footer"

export default function CountryCodeLayout(props: {
  children: React.ReactNode
}) {
  return (
    <>
      <Nav />
      {props.children}
      <Footer />
    </>
  )
}
