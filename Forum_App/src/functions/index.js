const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.sendReplyNotification = functions.firestore
  .document("responses/{responseId}")
  .onCreate(async (snap, context) => {
    const response = snap.data();

    const discussionRef = db.collection("discussions").doc(response.discussionId);
    const discussionSnap = await discussionRef.get();

    if (!discussionSnap.exists) {
      console.log("Discussion not found.");
      return null;
    }

    const discussion = discussionSnap.data();

    // Avoid notifying yourself if you replied to your own post
    if (response.authorId === discussion.authorId) return null;

    // Get sender's info (optional, for display)
    const senderSnap = await db.collection("users").doc(response.authorId).get();
    const sender = senderSnap.exists ? senderSnap.data() : { displayName: "Someone" };

    const notification = {
      recipientId: discussion.authorId,
      senderId: response.authorId,
      senderName: sender.displayName,
      message: "replied to your discussion",
      read: false,
      type: "reply",
      relatedDocId: response.discussionId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("notifications").add(notification);
    return null;
  });
