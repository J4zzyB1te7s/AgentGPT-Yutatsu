import type { ReactNode } from "react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import HideShow from "../motions/HideShow";
import clsx from "clsx";
import type { HeaderProps } from "./MacWindowHeader";
import { MacWindowHeader, messageListId } from "./MacWindowHeader";
import { FaArrowCircleDown, FaCommentDots } from "react-icons/fa";
import { useAgentStore } from "../../stores";
import { ImSpinner2 } from "react-icons/im";
import Input from "../Input";
import Button from "../Button";

interface ChatControls {
  value: string;
  onChange: (string) => void;
  handleChat: () => Promise<void>;
  loading?: boolean;
}

interface ChatWindowProps extends HeaderProps {
  children?: ReactNode;
  setAgentRun?: (name: string, goal: string) => void;
  visibleOnMobile?: boolean;
  chatControls?: ChatControls;
}

const ChatWindow = ({
  messages,
  children,
  title,
  visibleOnMobile,
  chatControls,
}: ChatWindowProps) => {
  const [t] = useTranslation();
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const isThinking = useAgentStore.use.isAgentThinking();
  const isStopped = useAgentStore.use.lifecycle() === "stopped";
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

    // Use has scrolled if we have scrolled up at all from the bottom
    const hasUserScrolled = scrollTop < scrollHeight - clientHeight - 10;
    setHasUserScrolled(hasUserScrolled);
  };

  const handleScrollToBottom = (behaviour: "instant" | "smooth") => {
    if (!scrollRef || !scrollRef.current) return;

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: behaviour,
    });
  };

  useEffect(() => {
    if (!hasUserScrolled) {
      handleScrollToBottom("instant");
    }
  });

  return (
    <div
      className={clsx(
        "border-translucent h-full w-full max-w-[inherit] flex-1 flex-col overflow-auto rounded-2xl border-2 border-white/20 bg-zinc-900 text-white shadow-2xl drop-shadow-lg transition-all duration-500",
        visibleOnMobile ? "flex" : "hidden xl:flex"
      )}
    >
      <HideShow
        showComponent={hasUserScrolled}
        className="absolute bottom-14 right-6 cursor-pointer"
      >
        <FaArrowCircleDown
          onClick={() => handleScrollToBottom("smooth")}
          className="h-6 w-6 animate-bounce md:h-7 md:w-7"
        />
      </HideShow>

      <MacWindowHeader title={title} messages={messages} />
      <div
        className="mb-2 mr-2 flex-1 overflow-auto transition-all duration-500"
        ref={scrollRef}
        onScroll={handleScroll}
        id={messageListId}
      >
        {children}
        <div
          className={clsx(
            isThinking && !isStopped ? "opacity-100" : "opacity-0",
            "mx-2 flex flex-row items-center gap-2 rounded-lg border border-white/20 p-2 font-mono transition duration-300 sm:mx-4",
            "text-xs sm:text-base"
          )}
        >
          <p>🧠 Thinking</p>
          <ImSpinner2 className="animate-spin" />
        </div>
      </div>
      {chatControls && (
        <div className="mt-auto flex flex-row gap-2 p-2 sm:p-4">
          <Input
            small
            placeholder="Chat with your agent..."
            value={chatControls.value}
            onChange={(e) => chatControls?.onChange(e.target.value)}
          />
          <Button
            className="px-1 py-1 sm:px-3 md:py-1"
            onClick={chatControls?.handleChat}
            disabled={chatControls.loading}
          >
            <FaCommentDots />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
