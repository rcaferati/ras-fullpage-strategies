import React from "react";
import "./layout.scss";
import Nav from "../nav/nav";

const Layout = ({ children }) => {
  return (
    <>
      <Nav />
      <main>{children}</main>
    </>
  );
};

export default Layout;
