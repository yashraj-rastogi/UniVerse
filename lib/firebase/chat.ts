import { collection, addDoc, query, orderBy, onSnapshot, doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "./config"

export interface Message {
  id: string
  chatId: string
  senderId: string
  senderEmail: string
  senderRollNumber: string
  text: string
  createdAt: string
}

export interface Chat {
  id: string
  participants: string[] // Array of user IDs
  participantDetails: {
    [userId: string]: {
      email: string
      rollNumber: string
    }
  }
  itemName: string
  itemType: "listing" | "request"
  lastMessage?: string
  lastMessageAt: string
  createdAt: string
}

// Create a unique chat ID based on participants and item
function generateChatId(userId1: string, userId2: string, itemId: string): string {
  const sortedUsers = [userId1, userId2].sort()
  return `${sortedUsers[0]}_${sortedUsers[1]}_${itemId}`
}

// Create or get existing chat
export async function createOrGetChat(
  currentUserId: string,
  currentUserEmail: string,
  currentUserRollNumber: string,
  otherUserId: string,
  otherUserEmail: string,
  otherUserRollNumber: string,
  itemId: string,
  itemName: string,
  itemType: "listing" | "request",
): Promise<string> {
  if (!currentUserId || !otherUserId || !itemId) {
    throw new Error("Missing required parameters for chat creation")
  }

  if (!currentUserEmail || !otherUserEmail) {
    throw new Error("User email is required for chat")
  }

  if (!currentUserRollNumber || !otherUserRollNumber) {
    throw new Error("User roll number is required for chat")
  }

  const chatId = generateChatId(currentUserId, otherUserId, itemId)
  const chatRef = doc(db, "chats", chatId)

  // Check if chat already exists
  const chatDoc = await getDoc(chatRef)

  if (!chatDoc.exists()) {
    // Create new chat
    const chatData: Omit<Chat, "id"> = {
      participants: [currentUserId, otherUserId],
      participantDetails: {
        [currentUserId]: {
          email: currentUserEmail,
          rollNumber: currentUserRollNumber,
        },
        [otherUserId]: {
          email: otherUserEmail,
          rollNumber: otherUserRollNumber,
        },
      },
      itemName,
      itemType,
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    await setDoc(chatRef, chatData)
  }

  return chatId
}

// Send a message
export async function sendMessage(
  chatId: string,
  senderId: string,
  senderEmail: string,
  senderRollNumber: string,
  text: string,
): Promise<void> {
  const messagesRef = collection(db, "chats", chatId, "messages")

  const messageData = {
    chatId,
    senderId,
    senderEmail,
    senderRollNumber,
    text,
    createdAt: new Date().toISOString(),
  }

  await addDoc(messagesRef, messageData)

  // Update last message in chat document
  const chatRef = doc(db, "chats", chatId)
  await setDoc(
    chatRef,
    {
      lastMessage: text,
      lastMessageAt: new Date().toISOString(),
    },
    { merge: true },
  )
}

// Subscribe to messages in a chat
export function subscribeToMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
  const messagesRef = collection(db, "chats", chatId, "messages")
  const q = query(messagesRef, orderBy("createdAt", "asc"))

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[]

    callback(messages)
  })
}

// Get user's chats
export function subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void): () => void {
  const chatsRef = collection(db, "chats")
  const q = query(chatsRef, orderBy("lastMessageAt", "desc"))

  return onSnapshot(q, (snapshot) => {
    const chats: Chat[] = []

    // Filter on client side to avoid composite index
    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      if (data.participants && data.participants.includes(userId)) {
        chats.push({
          id: doc.id,
          ...data,
        } as Chat)
      }
    })

    callback(chats)
  })
}

// Get chat details
export async function getChat(chatId: string): Promise<Chat | null> {
  const chatRef = doc(db, "chats", chatId)
  const chatDoc = await getDoc(chatRef)

  if (chatDoc.exists()) {
    return {
      id: chatDoc.id,
      ...chatDoc.data(),
    } as Chat
  }

  return null
}
