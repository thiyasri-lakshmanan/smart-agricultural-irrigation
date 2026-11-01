import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

// Helper to check if user has admin/operator privileges
export const isOperatorUser = (user) => {
  if (!user) return false;
  const email = (user.email || '').toLowerCase();
  return email === 'operator@agriflow.org' || email.includes('admin') || email.includes('operator');
};

/**
 * Submits a new irrigation request to Cloud Firestore.
 * Also logs an audit activity record in `activity_logs`.
 */
export async function submitIrrigationRequest(user, requestPayload) {
  if (!user || !user.uid) {
    throw new Error('User must be authenticated to submit an irrigation request.');
  }

  const timestamp = new Date();
  const dateFormatted = timestamp.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Generate a friendly request ID (e.g., REQ-7482)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const generatedId = `REQ-${randomSuffix}`;

  const requestDocument = {
    requestId: generatedId,
    userId: user.uid,
    userEmail: user.email || 'operator@agriflow.org',
    userName: user.displayName || user.email?.split('@')[0] || 'Farmer Operator',
    fieldId: requestPayload.fieldId,
    farmerName: requestPayload.farmerName,
    cropName: requestPayload.cropName,
    cropType: requestPayload.cropName,
    requestType: requestPayload.requestType,
    waterRequired: Number(requestPayload.waterRequired),
    waterQuantity: Number(requestPayload.waterRequired),
    priority: requestPayload.priority,
    status: 'Pending Review',
    createdAt: serverTimestamp(),
    requestDate: dateFormatted,
    notes: requestPayload.notes || `Standard canal request for ${requestPayload.cropName}`,
  };

  // 1. Add to irrigation_requests collection
  const requestDocRef = await addDoc(collection(db, 'irrigation_requests'), requestDocument);

  // 2. Also log an audit entry in activity_logs collection
  try {
    await addDoc(collection(db, 'activity_logs'), {
      requestId: generatedId,
      docId: requestDocRef.id,
      userId: user.uid,
      userEmail: user.email,
      activity: requestPayload.requestType === 'Drought Relief' ? 'Emergency Relief Request' : 'Irrigation Demand Queued',
      description: `Request ${generatedId} submitted for Field ${requestPayload.fieldId} (${requestPayload.cropName}) - ${Number(requestPayload.waterRequired).toLocaleString()} Litres.`,
      status: 'Pending Review',
      createdAt: serverTimestamp(),
      date: dateFormatted,
    });
  } catch (logErr) {
    console.warn('Activity log write error (non-fatal):', logErr);
  }

  return { id: requestDocRef.id, ...requestDocument };
}

/**
 * Subscribes to real-time irrigation requests.
 * Standard users listen to their own requests (`userId == user.uid`).
 * Operators/Admins can see all requests if requested.
 */
export function subscribeToIrrigationRequests(user, callback, onError, viewAllForAdmin = false) {
  if (!user || !user.uid) {
    callback([]);
    return () => {};
  }

  const isOperator = isOperatorUser(user);
  let q;

  // If user is operator and requested all records, query whole collection
  if (isOperator && viewAllForAdmin) {
    q = collection(db, 'irrigation_requests');
  } else {
    // Standard user or operator viewing personal requests
    q = query(collection(db, 'irrigation_requests'), where('userId', '==', user.uid));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          ...data,
          // Fallback date formatting if createdAt timestamp is available
          displayDate: data.requestDate || (data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : 'Recent'),
        });
      });

      // Sort in-memory by createdAt descending (most recent first)
      // This avoids requiring complex Firestore Composite Index configuration!
      items.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });

      callback(items);
    },
    (err) => {
      console.error('Error fetching irrigation requests:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribes to user's activity logs or all activity logs for operator.
 */
export function subscribeToActivityLogs(user, callback, onError, viewAllForAdmin = false) {
  if (!user || !user.uid) {
    callback([]);
    return () => {};
  }

  const isOperator = isOperatorUser(user);
  let q;

  if (isOperator && viewAllForAdmin) {
    q = collection(db, 'activity_logs');
  } else {
    q = query(collection(db, 'activity_logs'), where('userId', '==', user.uid));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          ...data,
          displayDate: data.date || (data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : 'Recent'),
        });
      });

      items.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });

      callback(items);
    },
    (err) => {
      console.error('Error fetching activity logs:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Updates an irrigation request status (e.g. by operator/admin to 'Approved', 'Fulfilled', 'Rejected').
 */
export async function updateRequestStatus(docId, newStatus) {
  const docRef = doc(db, 'irrigation_requests', docId);
  await updateDoc(docRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
}
