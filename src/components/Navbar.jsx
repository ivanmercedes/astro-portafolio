import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
} from "@nextui-org/react";

export default function App() {
  return (
    <Navbar isBordered maxWidth="lg">
      <NavbarBrand>
        <a href="/">
          <p className="font-bold text-inherit text-xl">Ivan Mercedes</p>
        </a>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {/* <NavbarItem>
          <Link color="foreground" href="#">
            Proyectos
          </Link>
        </NavbarItem> */}
        <NavbarItem >
          <Link href="/blog" color="foreground" aria-current="page">
            Blog
          </Link>
        </NavbarItem>
        <NavbarItem>
            {/* <Link
              color="foreground"
              href="#"
              className="bg-gradient-to-tr from-primary-500 to-secondary-500 text-white shadow-lg px-5 font-bold py-2 rounded-full"
            >
              Contacto
            </Link> */}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
