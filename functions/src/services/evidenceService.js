const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Appends a single interaction (user answer or AI response) to the raw_history subcollection.
 */
const appendToHistory = async (userId, type, content) => {
    const historyRef = db.collection("users").doc(userId).collection("raw_history");
    await historyRef.add({
        type: type, // 'user' | 'ai'
        content: content,
        timestamp: FieldValue.serverTimestamp()
    });
};

/**
 * Bulk saves Stage 1 context form answers into raw_history.
 */
const bulkSaveStageOne = async (userId, answersObj) => {
    const batch = db.batch();
    const historyRef = db.collection("users").doc(userId).collection("raw_history");
    const userRef = db.collection("users").doc(userId);
    
    // Save each Stage 1 answer sequentially
    for (const [key, val] of Object.entries(answersObj)) {
        const docRef = historyRef.doc();
        batch.set(docRef, {
            type: 'user',
            context: key,
            content: val,
            stage: 1,
            timestamp: FieldValue.serverTimestamp()
        });
    }

    // Initialize an empty evidence map if it doesn't exist
    batch.set(userRef, {
        evidence_map: {
            traits: {},
            last_updated: FieldValue.serverTimestamp()
        }
    }, { merge: true });

    await batch.commit();
};

/**
 * Fetches the raw history chronological list.
 */
const getRawHistory = async (userId, limit = 50) => {
    const historyRef = db.collection("users").doc(userId).collection("raw_history");
    const snapshot = await historyRef.orderBy("timestamp", "asc").limit(limit).get();
    
    return snapshot.docs.map(doc => doc.data());
};

/**
 * Fetches the current Evidence Map.
 */
const getEvidenceMap = async (userId) => {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();
    if (!doc.exists) return null;
    return doc.data().evidence_map || { traits: {} };
};

/**
 * Updates the Evidence Map after a Deep Thinking pulse.
 */
const updateEvidenceMap = async (userId, newEvidenceMapObject) => {
    const userRef = db.collection("users").doc(userId);
    await userRef.set({
        evidence_map: newEvidenceMapObject,
        evidence_map_updated_at: FieldValue.serverTimestamp()
    }, { merge: true });
};

module.exports = {
    appendToHistory,
    bulkSaveStageOne,
    getRawHistory,
    getEvidenceMap,
    updateEvidenceMap
};
