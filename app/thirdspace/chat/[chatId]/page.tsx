import { SecureChatWindow } from "@/components/thirdspace/secure-chat-window"

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  return <SecureChatWindow chatId={chatId} />
}
