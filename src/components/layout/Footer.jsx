const Footer = () => {
  return (
    <footer
      style={{
        padding: '24px 48px',
        borderTop: '1px solid #E5E7EB',
        background: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span style={{
  fontSize: '13px',
  lineHeight: '16px',
  fontWeight: 400,
  color: '#374151',
}}>
  © 2026 EGY MED CHAIN. All Rights Reserved
</span>
      <span style={{
  fontSize: '13px',
  lineHeight: '16px',
  fontWeight: 500,
  color: '#224A8A',
}}>
  Our Healthcare Partners
</span>
    </footer>
  );
};

export default Footer;