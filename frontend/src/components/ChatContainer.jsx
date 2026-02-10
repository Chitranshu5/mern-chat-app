// // ChatContainer.jsx
// import { useEffect, useRef, useState } from "react";
// import { useChatStore } from "../store/useChatStore";
// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./MessageSkeleton";
// import { useAuthStore } from "../store/useAuthStore";
// import { formatMessageTime } from "../lib/utils";
// import { ArrowLeft, ChevronUp } from "lucide-react";

// const ChatContainer = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     isLoadingMoreMessages,
//     selectedUser,
//     setSelectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//     loadMoreMessages,
//     hasMoreMessages,
//   } = useChatStore();

//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);
//   const messageContainerRef = useRef(null);
//   const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
//   const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);
//   const previousScrollHeight = useRef(0);
//   const isLoadingMore = useRef(false); // Track if we're loading more messages

//   // Initial load
//   useEffect(() => {
//     if (selectedUser?._id) {
//       getMessages(selectedUser._id, 1).then(() => {
//         setShouldScrollToBottom(true);
//       });
//       subscribeToMessages();
//     }
//     return () => unsubscribeFromMessages();
//   }, [
//     selectedUser?._id,
//     getMessages,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//   ]);

//   // Auto scroll to bottom
//   useEffect(() => {
//     if (shouldScrollToBottom && messageEndRef.current && messages.length > 0) {
//       setTimeout(() => {
//         messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//         setShouldScrollToBottom(false);
//       }, 100);
//     }
//   }, [messages, shouldScrollToBottom]);

//   // Maintain scroll position when loading more
//   useEffect(() => {
//     if (messageContainerRef.current && previousScrollHeight.current > 0) {
//       const container = messageContainerRef.current;
//       const newScrollHeight = container.scrollHeight;
//       const scrollDiff = newScrollHeight - previousScrollHeight.current;

//       if (scrollDiff > 0) {
//         container.scrollTop = scrollDiff;
//         previousScrollHeight.current = 0;
//         isLoadingMore.current = false; // Reset loading flag
//       }
//     }
//   }, [messages]);

//   // Detect scroll position - show button when near top
//   useEffect(() => {
//     const container = messageContainerRef.current;
//     if (!container) return;

//     const handleScroll = () => {
//       const scrollTop = container.scrollTop;
//       const scrollHeight = container.scrollHeight;
//       const clientHeight = container.clientHeight;

//       // Calculate distance from top (how much content is above)
//       const distanceFromTop = scrollTop;

//       // Show button when scrolled up AND there's more content above
//       // If scrollTop < 500px from top AND has more messages, show button
//       if (
//         distanceFromTop < 500 &&
//         hasMoreMessages &&
//         scrollHeight > clientHeight
//       ) {
//         setShowLoadMoreButton(true);
//       } else {
//         setShowLoadMoreButton(false);
//       }
//     };

//     // Throttle scroll events
//     let scrollTimeout;
//     const throttledScroll = () => {
//       if (scrollTimeout) return;
//       scrollTimeout = setTimeout(() => {
//         handleScroll();
//         scrollTimeout = null;
//       }, 100);
//     };

//     container.addEventListener("scroll", throttledScroll);

//     // Check initially after messages load
//     const checkInitial = setTimeout(() => {
//       handleScroll();
//     }, 200);

//     return () => {
//       container.removeEventListener("scroll", throttledScroll);
//       clearTimeout(checkInitial);
//       if (scrollTimeout) clearTimeout(scrollTimeout);
//     };
//   }, [hasMoreMessages, messages.length]);

//   // Handle load more button click
//   const handleLoadMore = async () => {
//     if (!messageContainerRef.current) return;

//     // Set flag to prevent auto-scroll
//     isLoadingMore.current = true;
//     previousScrollHeight.current = messageContainerRef.current.scrollHeight;
//     await loadMoreMessages();
//   };

//   // Auto-scroll for new messages (but NOT when loading more)
//   useEffect(() => {
//     const container = messageContainerRef.current;
//     if (!container || messages.length === 0 || isLoadingMore.current) return;

//     const scrollBottom =
//       container.scrollHeight - container.scrollTop - container.clientHeight;
//     const isNearBottom = scrollBottom < 200;
//     const isOwnMessage =
//       messages[messages.length - 1]?.senderId === authUser._id;

//     if (isNearBottom || isOwnMessage) {
//       setShouldScrollToBottom(true);
//     }
//   }, [messages.length, authUser._id]);

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-hidden">
//       {/* Mobile header */}
//       <div className="flex md:hidden items-center gap-3 p-4 border-b border-base-300 bg-base-100">
//         <button
//           onClick={() => setSelectedUser(null)}
//           className="btn btn-sm btn-circle btn-ghost"
//         >
//           <ArrowLeft className="size-5" />
//         </button>
//         <div className="flex items-center gap-3">
//           <div className="relative">
//             <img
//               src={
//                 selectedUser.profilePic ||
//                 "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
//               }
//               alt={selectedUser.name}
//               className="size-10 rounded-full object-cover"
//             />
//           </div>
//           <div>
//             <h3 className="font-semibold">{selectedUser.name}</h3>
//           </div>
//         </div>
//       </div>

//       {/* Desktop header */}
//       <div className="hidden md:block">
//         <ChatHeader />
//       </div>

//       {/* Messages container */}
//       <div
//         ref={messageContainerRef}
//         className="flex-1 overflow-y-auto p-4 space-y-4 relative"
//       >
//         {/* Load More Button - Shows when scrolled near top */}
//         {showLoadMoreButton && hasMoreMessages && (
//           <div className="sticky top-2 z-10 flex justify-center">
//             <button
//               onClick={handleLoadMore}
//               disabled={isLoadingMoreMessages}
//               className="btn btn-sm btn-primary gap-2 shadow-xl"
//             >
//               {isLoadingMoreMessages ? (
//                 <>
//                   <span className="loading loading-spinner loading-xs"></span>
//                   Loading...
//                 </>
//               ) : (
//                 <>
//                   <ChevronUp className="size-4" />
//                   Load 20 older messages
//                 </>
//               )}
//             </button>
//           </div>
//         )}

//         {/* No more messages indicator */}
//         {!hasMoreMessages && messages.length > 0 && (
//           <div className="flex justify-center py-2">
//             <div className="text-xs text-base-content/50 bg-base-200 px-3 py-1 rounded-full">
//               🏁 Beginning of conversation
//             </div>
//           </div>
//         )}

//         {/* Empty state */}
//         {messages.length === 0 && (
//           <div className="flex justify-center items-center h-full">
//             <div className="text-center text-base-content/50">
//               <p>No messages yet</p>
//               <p className="text-sm mt-1">Start the conversation!</p>
//             </div>
//           </div>
//         )}

//         {/* Messages */}
// {messages.map((message) => (
//   <div
//     key={message._id}
//     className={`flex ${message.senderId === authUser._id ? "justify-end" : "justify-start"} mb-4 px-3`}
//   >
//     <div className={`flex flex-col max-w-[85%] ${message.senderId === authUser._id ? "items-end" : "items-start"}`}>
//       {/* Message Bubble */}
//       <div
//         className={`rounded-2xl px-4 py-3 shadow-sm ${
//           message.senderId === authUser._id
//             ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
//             : "bg-gradient-to-r from-gray-50 to-white text-gray-800 rounded-bl-md border border-gray-100"
//         }`}
//       >
//         <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
//           {message.text}
//         </p>
//       </div>
      
//       {/* Timestamp */}
//       <span
//         className={`text-[11px] text-gray-400 mt-1 px-1 font-medium ${
//           message.senderId === authUser._id ? "text-right" : "text-left"
//         }`}
//       >
//         {formatMessageTime(message.createdAt)}
//       </span>
//     </div>
//   </div>
// ))}
//         {/* Scroll anchor */}
//         <div ref={messageEndRef} />
//       </div>

//       <MessageInput />
//     </div>
//   );
// };

// export default ChatContainer;

// ChatContainer.jsx
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { ArrowLeft, ChevronUp } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    isLoadingMoreMessages,
    selectedUser,
    setSelectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    loadMoreMessages,
    hasMoreMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);

  const previousScrollHeight = useRef(0);
  const isLoadingMore = useRef(false);

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id, 1).then(() => {
        setShouldScrollToBottom(true);
      });
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // ===============================
  // AUTO SCROLL TO BOTTOM
  // ===============================
  useEffect(() => {
    if (
      shouldScrollToBottom &&
      messageEndRef.current &&
      messages.length > 0 &&
      !isLoadingMore.current
    ) {
      setTimeout(() => {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        setShouldScrollToBottom(false);
      }, 100);
    }
  }, [messages.length, shouldScrollToBottom]);

  // ===============================
  // MAINTAIN SCROLL POSITION (FIXED)
  // ===============================
  useEffect(() => {
    if (!isLoadingMore.current) return;
    if (!messageContainerRef.current) return;

    const container = messageContainerRef.current;

    requestAnimationFrame(() => {
      const newScrollHeight = container.scrollHeight;
      const scrollDiff =
        newScrollHeight - previousScrollHeight.current;

      container.scrollTop = scrollDiff;

      previousScrollHeight.current = 0;
      isLoadingMore.current = false;
    });
  }, [messages.length]);

  // ===============================
  // SHOW LOAD MORE BUTTON
  // ===============================
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      if (
        scrollTop < 500 &&
        hasMoreMessages &&
        scrollHeight > clientHeight
      ) {
        setShowLoadMoreButton(true);
      } else {
        setShowLoadMoreButton(false);
      }
    };

    let timeout;
    const throttledScroll = () => {
      if (timeout) return;
      timeout = setTimeout(() => {
        handleScroll();
        timeout = null;
      }, 100);
    };

    container.addEventListener("scroll", throttledScroll);

    setTimeout(handleScroll, 200);

    return () => {
      container.removeEventListener("scroll", throttledScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, [hasMoreMessages, messages.length]);

  // ===============================
  // HANDLE LOAD MORE CLICK
  // ===============================
  const handleLoadMore = async () => {
    if (!messageContainerRef.current) return;

    isLoadingMore.current = true;
    previousScrollHeight.current =
      messageContainerRef.current.scrollHeight;

    await loadMoreMessages();
  };

  // ===============================
  // AUTO SCROLL FOR NEW MESSAGES
  // ===============================
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container || messages.length === 0) return;
    if (isLoadingMore.current) return;

    const scrollBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    const isNearBottom = scrollBottom < 200;
    const isOwnMessage =
      messages[messages.length - 1]?.senderId === authUser._id;

    if (isNearBottom || isOwnMessage) {
      setShouldScrollToBottom(true);
    }
  }, [messages.length, authUser._id]);

  // ===============================
  // LOADING STATE
  // ===============================
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile header */}
      <div className="flex md:hidden items-center gap-3 p-4 border-b border-base-300 bg-base-100">
        <button
          onClick={() => setSelectedUser(null)}
          className="btn btn-sm btn-circle btn-ghost"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="flex items-center gap-3">
          <img
            src={
              selectedUser.profilePic ||
              "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            }
            alt={selectedUser.name}
            className="size-10 rounded-full object-cover"
          />
          <h3 className="font-semibold">{selectedUser.name}</h3>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:block">
        <ChatHeader />
      </div>

      {/* Messages */}
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
      >
        {showLoadMoreButton && hasMoreMessages && (
          <div className="sticky top-2 z-10 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMoreMessages}
              className="btn btn-sm btn-primary gap-2 shadow-xl"
            >
              {isLoadingMoreMessages ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Loading...
                </>
              ) : (
                <>
                  <ChevronUp className="size-4" />
                  Load 20 older messages
                </>
              )}
            </button>
          </div>
        )}

        {!hasMoreMessages && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <div className="text-xs text-base-content/50 bg-base-200 px-3 py-1 rounded-full">
              🏁 Beginning of conversation
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.senderId === authUser._id
                ? "justify-end"
                : "justify-start"
            } mb-4 px-3`}
          >
            <div
              className={`flex flex-col max-w-[85%] ${
                message.senderId === authUser._id
                  ? "items-end"
                  : "items-start"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  message.senderId === authUser._id
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                    : "bg-gradient-to-r from-gray-50 to-white text-gray-800 rounded-bl-md border border-gray-100"
                }`}
              >
                <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                  {message.text}
                </p>
              </div>

              <span className="text-[11px] text-gray-400 mt-1 px-1 font-medium">
                {formatMessageTime(message.createdAt)}
              </span>
            </div>
          </div>
        ))}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;


