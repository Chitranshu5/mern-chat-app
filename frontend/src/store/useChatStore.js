// useChatStore.js
import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => {
  return {
    users: [],
    messages: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isLoadingMoreMessages: false,
    currentPage: 1,
    hasMoreMessages: true,
    totalMessages: 0,

    getUsers: async () => {
      set({ isUsersLoading: true });
      try {
        const res = await axiosInstance.get("/messages/users");
        set({ users: res.data });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load users");
      } finally {
        set({ isUsersLoading: false });
      }
    },

    getMessages: async (userId, page = 1) => {
      const isFirstLoad = page === 1;
      
      if (isFirstLoad) {
        set({ isMessagesLoading: true, messages: [], currentPage: 1 });
      } else {
        set({ isLoadingMoreMessages: true });
      }

      try {
        const res = await axiosInstance.get(`/messages/${userId}?page=${page}&limit=20`);
        
        let newMessages, pagination;
        
        // Check if backend returns new format or old format
        if (res.data && res.data.messages && res.data.pagination) {
          // NEW FORMAT: { messages: [...], pagination: {...} }
          newMessages = res.data.messages;
          pagination = res.data.pagination;
        } else if (Array.isArray(res.data)) {
          // OLD FORMAT: Just an array [...]
          newMessages = res.data;
          pagination = {
            currentPage: 1,
            totalPages: 1,
            totalMessages: res.data.length,
            hasMore: false,
          };
        } else {
          throw new Error('Invalid response format from server');
        }

        const currentMessages = get().messages;

        // For first load: replace all messages
        // For pagination: prepend older messages
        const updatedMessages = isFirstLoad 
          ? newMessages 
          : [...newMessages, ...currentMessages];

        set({
          messages: updatedMessages,
          currentPage: pagination.currentPage,
          hasMoreMessages: pagination.hasMore,
          totalMessages: pagination.totalMessages,
        });

        return newMessages.length;
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error(error.response?.data?.message || "Failed to load messages");
        return 0;
      } finally {
        if (isFirstLoad) {
          set({ isMessagesLoading: false });
        } else {
          set({ isLoadingMoreMessages: false });
        }
      }
    },

    loadMoreMessages: async () => {
      const { selectedUser, currentPage, hasMoreMessages, isLoadingMoreMessages } = get();
      
      if (!selectedUser || !hasMoreMessages || isLoadingMoreMessages) {
        return;
      }

      const nextPage = currentPage + 1;
      await get().getMessages(selectedUser._id, nextPage);
    },

    // sendMessage: async (messageData) => {
    //   const { selectedUser, messages } = get();
    //   try {
    //     const res = await axiosInstance.post(
    //       `/messages/send/${selectedUser._id}`,
    //       messageData
    //     );
    //     set({ messages: [...messages, res.data] });
    //   } catch (error) {
    //     toast.error(error.response?.data?.message || "Failed to send message");
    //   }
    // },


sendMessage: async (messageData) => {
  const { selectedUser } = get();
  const authUser = useAuthStore.getState().authUser;
  
  const optimisticMessage = {
    _id: `temp-${Date.now()}`,
    senderId: authUser._id,
    receiverId: selectedUser._id,
    text: messageData.text,
    image: messageData.image,
    createdAt: new Date().toISOString(),
  };

  // Add optimistic message
  set((state) => ({
    messages: [...state.messages, optimisticMessage]
  }));

  try {
    const res = await axiosInstance.post(
      `/messages/send/${selectedUser._id}`,
      messageData
    );

    // Replace with real message using latest state
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === optimisticMessage._id ? res.data : msg
      ),
    }));

  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to send message");
    
    // Optional: Remove failed message using latest state
    // set((state) => ({
    //   messages: state.messages.filter(msg => msg._id !== optimisticMessage._id)
    // }));
  }
},
    subscribeToMessages: () => {
      const { selectedUser } = get();
      if (!selectedUser) return;

      const socket = useAuthStore.getState().socket;
      socket.on("message", (message) => {
        const isMessageSentFromSelectedUser = message.senderId === selectedUser._id;
        if (!isMessageSentFromSelectedUser) return;

        set({ messages: [...get().messages, message] });
      });
    },

    unsubscribeFromMessages: () => {
      const socket = useAuthStore.getState().socket;
      socket.off("message");
    },

    setSelectedUser: (selectedUser) => {
      set({ 
        selectedUser,
        messages: [],
        currentPage: 1,
        hasMoreMessages: true,
        totalMessages: 0,
      });
    },
  };
});