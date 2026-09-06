import React from 'react';
import { X, CheckCircle, Ban, ExternalLink, Calendar, MapPin, Mail, Phone, CreditCard, Shield } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { logAdminAction } from '../utils/auditLogger';

const DriverProfileModal = ({ driver, onClose }) => {
  const { hasPermission } = useAuthStore();

  if (!driver) return null;

  const handleValidate = async () => {
    if (!hasPermission('VERIFY_PROVIDERS')) {
      alert("Action non autorisée.");
      return;
    }
    if (window.confirm(`Confirmer la validation du dossier de ${driver.name} ?`)) {
      try {
        await updateDoc(doc(db, 'drivers', driver.id), { validationStatus: 'Validé' });
        await logAdminAction('VERIFY_PROVIDER', `providerId_${driver.id}`, 'Prestataire validé avec succès');
        onClose();
      } catch (error) {
        console.error("Erreur de validation:", error);
        alert("Erreur lors de la validation.");
      }
    }
  };

  const handleSuspend = async () => {
    if (!hasPermission('SUSPEND_USERS')) {
      alert("Action non autorisée.");
      return;
    }
    if (window.confirm(`Êtes-vous sûr de vouloir suspendre le prestataire ${driver.name} ?`)) {
      try {
        await updateDoc(doc(db, 'drivers', driver.id), { validationStatus: 'Suspendu' });
        await logAdminAction('SUSPEND_PROVIDER', `providerId_${driver.id}`, 'Prestataire suspendu');
        onClose();
      } catch (error) {
        console.error("Erreur de suspension:", error);
        alert("Erreur lors de la suspension.");
      }
    }
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
      <Icon className="text-slate-400 mt-0.5" size={18} />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value || 'Non renseigné'}</p>
      </div>
    </div>
  );

  const ImageThumbnail = ({ url, label }) => {
    if (!url) return null;
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-lg border border-slate-200 bg-slate-50 hover:border-primary transition-colors">
          <img src={url} alt={label} className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ExternalLink className="text-white" size={24} />
          </div>
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Dossier Chauffeur</h2>
            <p className="text-sm text-slate-500">Examen du dossier KYC et informations du prestataire</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column : Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-primary" />
                  Informations Personnelles
                </h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <InfoRow icon={Calendar} label="Prénom & Nom" value={`${driver.firstName || ''} ${driver.lastName || ''}`} />
                  <InfoRow icon={Phone} label="Téléphone" value={driver.phone} />
                  <InfoRow icon={Mail} label="Email" value={driver.email} />
                  <InfoRow icon={Calendar} label="Date de naissance" value={driver.dateOfBirth ? new Date(driver.dateOfBirth).toLocaleDateString() : null} />
                  <InfoRow icon={MapPin} label="Ville & Adresse" value={`${driver.mainCity || ''} - ${driver.address || ''}`} />
                  <InfoRow icon={CreditCard} label="Méthode de vérification" value={driver.verificationMethod} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-primary" />
                  Informations Véhicule
                </h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <InfoRow icon={Calendar} label="Type & Marque" value={`${driver.vehicleType || ''} - ${driver.vehicleBrand || ''}`} />
                  <InfoRow icon={Calendar} label="Modèle & Année" value={`${driver.vehicleModel || ''} (${driver.vehicleYear || ''})`} />
                  <InfoRow icon={CreditCard} label="Immatriculation" value={driver.vehiclePlate} />
                </div>
              </div>
            </div>

            {/* Right Column : Images */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Shield size={20} className="text-primary" />
                Documents Justificatifs
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <ImageThumbnail url={driver.selfieUrl} label="Selfie de sécurité" />
                
                <ImageThumbnail 
                  url={driver.idFrontUrl} 
                  label={driver.verificationMethod === 'PERMIS' ? 'Permis (Recto)' : 
                         driver.verificationMethod === 'PASSEPORT' ? 'Passeport' : 'Pièce d\'identité (Recto)'} 
                />
                
                {driver.idBackUrl && (
                  <ImageThumbnail 
                    url={driver.idBackUrl} 
                    label={driver.verificationMethod === 'PERMIS' ? 'Permis (Verso)' : 'Pièce d\'identité (Verso)'} 
                  />
                )}
                
                {driver.driverLicenseFrontUrl && driver.verificationMethod !== 'PERMIS' && (
                  <ImageThumbnail url={driver.driverLicenseFrontUrl} label="Permis (Recto)" />
                )}
                
                {driver.driverLicenseBackUrl && driver.verificationMethod !== 'PERMIS' && (
                  <ImageThumbnail url={driver.driverLicenseBackUrl} label="Permis (Verso)" />
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Statut actuel :</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              driver.validation === 'Validé' ? 'bg-emerald-100 text-emerald-800' : 
              driver.validation === 'Suspendu' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {driver.validation}
            </span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSuspend}
              className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Ban size={18} />
              Refuser / Suspendre
            </button>
            <button
              onClick={handleValidate}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Valider le profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfileModal;
