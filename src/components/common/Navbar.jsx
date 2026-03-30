import { useEffect, useState } from "react"
import { AiOutlineMenu, AiOutlineShoppingCart, AiOutlineClose } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"

import logo from "../../assets/Logo/Logo-Full-Light.png"
import { NavbarLinks } from "../../data/navbar-links"
import { apiConnector } from "../../services/apiconnecter"
import { categories } from "../../services/apis"
import { ACCOUNT_TYPE } from "../../utils/constants"
import ProfileDropdown from "../core/Auth/ProfileDropDown"

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const location = useLocation()

  const [subLinks, setSubLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setSubLinks(res.data.data)
      } catch (error) {
        console.log("Could not fetch Categories.", error)
      }
      setLoading(false)
    })()
  }, [])

  // Mobile menu band karo jab route change ho
  useEffect(() => {
    setMobileMenuOpen(false)
    setCatalogOpen(false)
  }, [location])

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <div
      className={`relative z-50 flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 ${
        location.pathname !== "/" ? "bg-richblack-800" : ""
      } transition-all duration-200`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-6 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <div
                    className={`group relative flex cursor-pointer items-center gap-1 ${
                      matchRoute("/catalog/:catalogName")
                        ? "text-yellow-25"
                        : "text-richblack-25"
                    }`}
                  >
                    <p>{link.title}</p>
                    <BsChevronDown />
                    <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                      <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                      {loading ? (
                        <p className="text-center">Loading...</p>
                      ) : subLinks && subLinks.length ? (
                        subLinks
                          .filter((subLink) => subLink?.courses?.length > 0)
                          .map((subLink, i) => (
                            <Link
                              to={`/catalog/${subLink.name
                                .split(" ")
                                .join("-")
                                .toLowerCase()}`}
                              className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                              key={i}
                            >
                              <p>{subLink.name}</p>
                            </Link>
                          ))
                      ) : (
                        <p className="text-center">No Courses Found</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Login/Signup */}
        <div className="hidden items-center gap-x-4 md:flex">
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {token === null && (
              <Link to="/login">
                <button className="relative px-5 py-[7px] rounded-lg text-sm font-semibold bg-transparent text-richblack-100 border border-richblack-600 hover:border-[rgba(255,140,0,0.5)] hover:text-[#FF8C00] hover:bg-[rgba(255,140,0,0.06)] hover:-translate-y-[1px] transition-all duration-200">
                  Log in
                </button>
              </Link>
            )}
            {token === null && (
              <Link to="/signup">
                <button className="relative px-5 py-[7px] rounded-lg text-sm font-bold overflow-hidden bg-gradient-to-r from-[#FF6B00] via-[#FFD700] to-[#FF6B00] bg-[length:400%_400%] animate-shimmer text-black shadow-[0_2px_14px_rgba(255,140,0,0.35)] hover:shadow-[0_4px_22px_rgba(255,140,0,0.55)] hover:-translate-y-[2px] transition-all duration-200">
                  <span className="absolute top-0 -left-3/4 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-sweep pointer-events-none" />
                  Sign up
                </button>
              </Link>
            )}
          {token !== null && <ProfileDropdown />}
        </div>

        {/* Hamburger Button */}
        <button
          className="mr-4 md:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? (
            <AiOutlineClose fontSize={24} fill="#AFB2BF" />
          ) : (
            <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
          )}
        </button>
      </div>

      {/* ✅ Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 z-50 w-full bg-richblack-800 border-t border-richblack-700 flex flex-col px-6 py-4 gap-4 md:hidden shadow-lg">
          
          {/* Nav Links */}
          {NavbarLinks.map((link, index) => (
            <div key={index}>
              {link.title === "Catalog" ? (
                <div>
                  <button
                    className="flex w-full items-center justify-between text-richblack-25 py-2"
                    onClick={() => setCatalogOpen((prev) => !prev)}
                  >
                    <span>Catalog</span>
                    <BsChevronDown
                      className={`transition-transform duration-200 ${
                        catalogOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {catalogOpen && (
                    <div className="mt-2 flex flex-col gap-2 pl-4">
                      {loading ? (
                        <p className="text-richblack-300 text-sm">Loading...</p>
                      ) : subLinks && subLinks.length ? (
                        subLinks
                          .filter((subLink) => subLink?.courses?.length > 0)
                          .map((subLink, i) => (
                            <Link
                              to={`/catalog/${subLink.name
                                .split(" ")
                                .join("-")
                                .toLowerCase()}`}
                              className="text-richblack-100 py-2 hover:text-yellow-25 transition-colors"
                              key={i}
                            >
                              {subLink.name}
                            </Link>
                          ))
                      ) : (
                        <p className="text-richblack-300 text-sm">No Courses Found</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={link?.path}
                  className={`py-2 block ${
                    matchRoute(link?.path)
                      ? "text-yellow-25"
                      : "text-richblack-25"
                  }`}
                >
                  {link.title}
                </Link>
              )}
            </div>
          ))}

          {/* Divider */}
          <div className="border-t border-richblack-700" />

          {/* Cart */}
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="flex items-center gap-2 text-richblack-100">
              <AiOutlineShoppingCart className="text-xl" />
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-richblack-600 text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Login / Signup */}
          {token === null && (
              <div className="flex flex-col gap-3">
                <Link to="/login">
                  <button className="w-full rounded-lg border border-richblack-600 bg-transparent px-4 py-2 text-sm font-semibold text-richblack-100 hover:border-[rgba(255,140,0,0.5)] hover:text-[#FF8C00] hover:bg-[rgba(255,140,0,0.06)] transition-all duration-200">
                    Log in
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="relative w-full overflow-hidden rounded-lg px-4 py-2 text-sm font-bold text-black bg-gradient-to-r from-[#FF6B00] via-[#FFD700] to-[#FF6B00] bg-[length:400%_400%] animate-shimmer shadow-[0_2px_14px_rgba(255,140,0,0.35)] transition-all duration-200">
                    <span className="absolute top-0 -left-3/4 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-sweep pointer-events-none" />
                    Sign up
                  </button>
                </Link>
              </div>
            )}

          {/* Profile */}
          {token !== null && <ProfileDropdown />}
        </div>
      )}
    </div>
  )
}

export default Navbar