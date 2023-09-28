import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import { NavbarBrand } from 'react-bootstrap';
import styles from '../styles/layout.module.css';

function PageTab({tabName}) {
  return <button className={styles.NavTab}>{tabName}</button>;
}

function InfoItem({itemName}) {
  return <button className={styles.NavTab}>{itemName}</button>;
}

export default function Layout({ children }) {
  const pages = ['Home', 'Map Explorer'];
  const pageTabs = pages.map((page) => {
    return (
      <span key={page}>
        <PageTab tabName={page}/>
      </span>
    )
  })

  return (
    <>
      <main>
        <Head>
          <title>Boaty McBoatface Dashboard</title>
        </Head>
        <div className={styles.Box}>
          {/* navbar */}
          <div id={styles.NavContainer}>
            <Navbar expand="lg" className={styles.NavbarUva}>
              <Container fluid>
              <NavbarBrand>
                <img className={styles.NavbarBrand} width="24px" height="auto" src="https://upload.wikimedia.org/wikipedia/commons/d/dd/University_of_Virginia_Rotunda_logo.svg" alt="University of Virginia"/>
                <span className={styles.NavbarBrand} id={styles.DashboardName}>Boaty McBoatface Dashboard</span>
              </NavbarBrand>
              </Container>
            </Navbar>

            <Navbar expand="lg" className={styles.NavbarUva + " navbar-dark"}>
              <Container fluid id={styles.Tabs}>
                <div id={styles.Pages}>{pageTabs}</div>
                <div id={styles.Info}>
                  <Navbar.Toggle aria-controls="navbar-info"> 
                    <span className="navbar-toggler-icon">
                      <svg viewBox="0 0 18 18" fill="#F1F1EF">
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                        <g id="SVGRepo_iconCarrier"> 
                          <path fill="#F1F1EF" d="M17 5H1a1 1 0 0 1 0-2h16a1 1 0 0 1 0 2zm0 5H1a1 1 0 0 1 0-2h16a1 1 0 0 1 0 2zm0 5H1a1 1 0 0 1 0-2h16a1 1 0 0 1 0 2z"></path> 
                        </g>
                      </svg>
                    </span>
                  </Navbar.Toggle>

                  <Navbar.Collapse id="navbar-info">
                    <Nav className='ms-auto'>
                      <InfoItem itemName="Settings"></InfoItem>
                      <InfoItem itemName="About"></InfoItem>
                    </Nav>
                  </Navbar.Collapse>
                </div>
              </Container>
            </Navbar>
          </div>

          {/* page content */}
          {children}
        </div>
      </main>
    </>
  )
}
