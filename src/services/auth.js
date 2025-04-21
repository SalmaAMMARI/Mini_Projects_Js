import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export async function checkAdminStatus(userId) {
  if (!userId) return false;
  
  const db = getFirestore();
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() && userDoc.data().type === 'admin';
}

export async function getCurrentUserType() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  
  const db = getFirestore();
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  return userDoc.exists() ? userDoc.data().type : null;
}