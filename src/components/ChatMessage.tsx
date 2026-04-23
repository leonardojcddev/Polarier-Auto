import botAvatar from "@/assets/bot-avatar.svg";

interface ChatMessageProps {
  sender: "bot" | "user";
  text: string;
  time: string;
  initial?: string;
  avatarUrl?: string | null;
}

const ChatMessage = ({ sender, text, time, initial = "U", avatarUrl }: ChatMessageProps) => {
  if (sender === "bot") {
    return (
      <div className="flex gap-3 max-w-2xl">
        <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden">
          <img src={botAvatar} alt="Bot" className="w-5 h-5" />
        </div>
        <div>
          <div className="bg-muted rounded-xl rounded-tl-sm px-4 py-3 text-sm text-foreground">
            {text}
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">{time}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 max-w-2xl ml-auto flex-row-reverse">
      <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-xs font-bold text-secondary-foreground overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </div>
      <div className="text-right">
        <div className="bg-secondary/20 rounded-xl rounded-tr-sm px-4 py-3 text-sm text-foreground">
          {text}
        </div>
        <span className="text-xs text-muted-foreground mt-1 block">{time}</span>
      </div>
    </div>
  );
};

export default ChatMessage;
