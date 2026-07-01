export default function Footer() {
  return (
    <footer className="footer" aria-label="Footer">
      <div className="container" style={{ textAlign: 'center' }}>
        © {new Date().getFullYear()} Nyantuy Group
      </div>
    </footer>
  )
}
