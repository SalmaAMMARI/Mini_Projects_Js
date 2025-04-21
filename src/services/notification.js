// server/notifications.js
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});
// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD
  }
});

async function sendReplyNotification(discussionId, replyId) {
  const db = admin.firestore();
  
  try {
    // 1. Get the newly added reply
    const replyRef = db.collection('responses').doc(replyId);
    const replySnapshot = await replyRef.get();
    
    if (!replySnapshot.exists) {
      console.error('Reply not found');
      return;
    }
    const replyData = replySnapshot.data();

    // 2. Get the discussion details
    const discussionRef = db.collection('discussions').doc(discussionId);
    const discussionSnapshot = await discussionRef.get();
    
    if (!discussionSnapshot.exists) {
      console.error('Discussion not found');
      return;
    }
    const discussionData = discussionSnapshot.data();

    // 3. Get the discussion owner's details
    const userRef = db.collection('users').doc(discussionData.authorId);
    const userSnapshot = await userRef.get();
    
    if (!userSnapshot.exists) {
      console.error('User not found');
      return;
    }
    const userData = userSnapshot.data();

    // Don't send notification if user is replying to themselves
    if (replyData.authorId === discussionData.authorId) {
      console.log('Skipping notification - user replying to themselves');
      return;
    }

    // 4. Prepare email content
    const mailOptions = {
      from: `Your App <${process.env.GMAIL_EMAIL}>`,
      to: userData.email,
      subject: `New reply to your discussion: ${discussionData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">New Reply Notification</h2>
          <p>Hello ${userData.name || 'User'},</p>
          <p>You have received a new reply to your discussion:</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0;">${discussionData.title}</h3>
            <p style="font-style: italic;">"${replyData.contenu.substring(0, 150)}${replyData.contenu.length > 150 ? '...' : ''}"</p>
          </div>
          <a href="${process.env.APP_URL}/discussions/${discussionId}#${replyId}"
             style="display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px;">
            View Discussion
          </a>
          <p style="margin-top: 20px; color: #7f8c8d; font-size: 0.9em;">
            You're receiving this email because someone replied to your discussion.
          </p>
        </div>
      `
    };

    // 5. Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to ${userData.email}`);

    // 6. Also create an in-app notification
    await db.collection('notifications').add({
      userId: discussionData.authorId,
      type: 'reply',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      data: {
        discussionId: discussionId,
        discussionTitle: discussionData.title,
        replyId: replyId,
        replierName: replyData.authorName || 'Anonymous',
        replierId: replyData.authorId,
        contentPreview: replyData.contenu.substring(0, 100)
      }
    });
    console.log('In-app notification created');

  } catch (error) {
    console.error('Error in sendReplyNotification:', error);
    throw error; // Re-throw if you want calling function to handle it
  }
}

module.exports = { sendReplyNotification };