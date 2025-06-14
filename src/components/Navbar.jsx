import {
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";

export default function App() {
  return (
    <Navbar isBordered maxWidth="lg">
      <NavbarBrand>
        <a href="/">
          <p className="font-bold text-inherit text-xl">Ivan Mercedes</p>
        </a>
      </NavbarBrand>
      <NavbarContent className="sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link href="/projects" color="foreground" aria-current="page">
            Proyectos
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/blog" color="foreground" aria-current="page">
            Blog
          </Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
