
import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";



export function PublicLayout({ user, logout, login, register, company }) {
  return (
    <>
      <Outlet />
      <Footer company={company} />
    </>
  );
}
