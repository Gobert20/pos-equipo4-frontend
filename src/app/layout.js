export const metadata = {
  title: 'POS Equipo 4',
  description: 'Sistema Punto de Venta',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}