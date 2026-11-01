import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

/**
 * useAdminStatus — checks whether the currently logged-in Firebase user
 * is an administrator by looking for their UID in the `admins` Firestore
 * collection.
 *
 * Security model:
 *   • The `admins/{uid}` document is created ONLY by the project owner
 *     directly inside the Firebase Console (or via the Admin SDK).
 *   • Firestore rules forbid any client from writing to `admins/`.
 *   • Therefore, no user can grant themselves admin privileges through the app.
 *
 * @param {string|null|undefined} uid  Firebase Auth UID of the current user.
 * @returns {{ isAdmin: boolean, adminLoading: boolean }}
 */
export function useAdminStatus(uid) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    // No UID → definitely not an admin; stop loading immediately.
    if (!uid) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }

    // Listen in real-time so that if the owner ever revokes admin access from
    // the Firebase Console, the UI reflects that without requiring a refresh.
    const adminDocRef = doc(db, 'admins', uid);
    const unsubscribe = onSnapshot(
      adminDocRef,
      (snapshot) => {
        // Admin if and only if the document exists in the `admins` collection.
        setIsAdmin(snapshot.exists());
        setAdminLoading(false);
      },
      (err) => {
        // PERMISSION_DENIED is expected for regular farmers (Firestore rules
        // deny reads on other users' admin docs). Treat it as "not admin".
        if (err.code !== 'permission-denied') {
          console.warn('useAdminStatus: unexpected error reading admins doc:', err);
        }
        setIsAdmin(false);
        setAdminLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { isAdmin, adminLoading };
}

export default useAdminStatus;
