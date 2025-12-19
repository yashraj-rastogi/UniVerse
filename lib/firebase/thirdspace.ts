import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, getDoc, onSnapshot, where, updateDoc } from "firebase/firestore"
import { db } from "./config"

export interface Post {
  id?: string
  content: string
  userId: string
  createdAt: any
  isAnonymous: boolean
  alias: string
  likes: number
}

export interface SecureChat {
  id?: string
  postId: string
  postContent: string
  participants: string[] // [opUserId, peerUserId]
  createdAt: any
  lastMessage?: string
  lastMessageTimestamp?: any
}

export interface SecureMessage {
  id?: string
  senderId: string
  content: string
  createdAt: any
}

const ADJECTIVES = ["Neon", "Silent", "Hidden", "Cosmic", "Urban", "Digital", "Quiet", "Misty", "Solar", "Lunar"]
const NOUNS = ["Tiger", "Owl", "Ghost", "Walker", "Dreamer", "Echo", "Shadow", "Fox", "Phoenix", "Voyager"]

function generateAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `${adj} ${noun}`
}

export async function createPost(content: string, userId: string): Promise<string> {
  if (!content.trim()) {
    throw new Error("Content cannot be empty")
  }

  const post: Omit<Post, "id"> = {
    content: content.trim(),
    userId,
    createdAt: serverTimestamp(),
    isAnonymous: true,
    alias: generateAlias(),
    likes: 0
  }

  const docRef = await addDoc(collection(db, "community_posts"), post)
  return docRef.id
}

export async function getPosts(): Promise<Post[]> {
  const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"))
  
  const querySnapshot = await getDocs(q)
  const posts: Post[] = []

  querySnapshot.forEach((doc) => {
    const data = doc.data()
    posts.push({
      id: doc.id,
      ...data,
      // Handle timestamp conversion if needed, though Firestore timestamps usually work well with .toDate()
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
    } as Post)
  })

  return posts
}

// --- Secure Chat Functions ---

export async function createSecureChat(postId: string, postContent: string, opUserId: string, peerUserId: string): Promise<string> {
  // Check if a chat already exists between these two for this post?
  // For simplicity, we'll just create a new one for now, or we could query.
  // Let's query to prevent duplicates.
  const q = query(
    collection(db, "secure_chats"), 
    where("postId", "==", postId),
    where("participants", "array-contains", peerUserId)
  );
  
  const snapshot = await getDocs(q);
  // Filter client-side for exact match of participants if needed, but array-contains is usually enough for 1:1 if we check the other participant.
  // Actually, since we want a private chat between peer and OP, we should check if one exists.
  
  for (const doc of snapshot.docs) {
    const data = doc.data() as SecureChat;
    if (data.participants.includes(opUserId) && data.participants.includes(peerUserId)) {
      return doc.id;
    }
  }

  const chat: Omit<SecureChat, "id"> = {
    postId,
    postContent,
    participants: [opUserId, peerUserId],
    createdAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, "secure_chats"), chat)
  return docRef.id
}

export async function getSecureChat(chatId: string): Promise<SecureChat | null> {
  const docRef = doc(db, "secure_chats", chatId)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as SecureChat
  } else {
    return null
  }
}

export async function sendMessage(chatId: string, senderId: string, content: string) {
  if (!content.trim()) return;

  const message: Omit<SecureMessage, "id"> = {
    senderId,
    content: content.trim(),
    createdAt: serverTimestamp()
  }

  await addDoc(collection(db, "secure_chats", chatId, "messages"), message)
  
  // Update last message in chat doc
  await updateDoc(doc(db, "secure_chats", chatId), {
    lastMessage: content.trim(),
    lastMessageTimestamp: serverTimestamp()
  })
}

export function subscribeToMessages(chatId: string, callback: (messages: SecureMessage[]) => void) {
  const q = query(collection(db, "secure_chats", chatId, "messages"), orderBy("createdAt", "asc"))
  
  return onSnapshot(q, (snapshot) => {
    const messages: SecureMessage[] = []
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as SecureMessage)
    })
    callback(messages)
  }, (error) => {
    console.error("Error subscribing to messages:", error)
  })
}

export async function getUserChats(userId: string): Promise<SecureChat[]> {
  // Query without sorting to avoid composite index requirement
  const q = query(
    collection(db, "secure_chats"), 
    where("participants", "array-contains", userId)
  );
  
  const snapshot = await getDocs(q);
  const chats: SecureChat[] = [];
  
  snapshot.forEach((doc) => {
    chats.push({ id: doc.id, ...doc.data() } as SecureChat)
  });
  
  // Sort client-side
  return chats.sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
  });
}

