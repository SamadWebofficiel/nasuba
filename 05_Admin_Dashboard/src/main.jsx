import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>⚠️ Erreur Critique : Configuration Manquante</h1>
          <p style={{ marginBottom: '20px', textAlign: 'center', maxWidth: '600px' }}>
            Impossible de démarrer l'application. Avez-vous correctement configuré le fichier <strong>.env</strong> avec vos clés Firebase de production ?
          </p>
          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', overflow: 'auto', maxWidth: '80%' }}>
            <code>{this.state.error?.toString()}</code>
          </div>
          <p style={{ marginTop: '20px' }}>
            N'oubliez pas de redémarrer le serveur (<code>npm run dev</code>) après avoir modifié le fichier .env !
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
