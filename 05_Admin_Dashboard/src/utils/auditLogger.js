import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import useAuthStore from '../store/useAuthStore';

/**
 * Enregistre une action administrative dans la collection audit_logs
 * @param {string} action L'action effectuée (ex: 'SUSPEND_USER', 'VALIDATE_DRIVER')
 * @param {string} resource L'entité concernée (ex: 'userId_123', 'vehicleId_456')
 * @param {string} result Le résultat ou une description détaillée
 */
export const logAdminAction = async (action, resource, result) => {
  try {
    const { user, adminData } = useAuthStore.getState();
    
    if (!user || !adminData) {
      console.warn("Audit Log: Utilisateur non authentifié en tant qu'admin");
      return;
    }

    await addDoc(collection(db, 'audit_logs'), {
      adminId: user.uid,
      adminEmail: user.email,
      role: adminData.role,
      action,
      resource,
      result,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'audit log:", error);
  }
};
