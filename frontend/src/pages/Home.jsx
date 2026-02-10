// import ChatContainer from "../components/ChatContainer";
// import NoChatSelected from "../components/NoChatSelected";
// import Sidebar from "../components/Sidebar";
// import { useChatStore } from "../store/useChatStore";

// const Home = () => {
//   const { selectedUser } = useChatStore();
  
//   return (
//     <div className="h-screen bg-base-200">
//       <div className="flex items-center justify-center pt-20 px-4">
//         <div className="bg-base-100 rounded-lg shadow-xl max-w-6xl w-full h-[calc(100vh-8rem)]">
//           <div className="flex h-full rounded-lg overflow-hidden">
//             {/* Sidebar - hide on mobile when user selected */}
//             <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-auto`}>
//               <Sidebar />
//             </div>
            
//             {/* Chat area - hide on mobile when no user selected */}
//             <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} flex-1`}>
//               {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;


import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import Sidebar from "../components/Sidebar";
import { useChatStore } from "../store/useChatStore";

const Home = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      {/* Conditional padding - remove on mobile when user is selected */}
      <div className={`flex items-center justify-center px-4 ${
        selectedUser ? 'pt-0 md:pt-20' : 'pt-20'
      }`}>
        {/* Conditional height - full screen on mobile when user is selected */}
        <div className={`bg-base-100 rounded-lg shadow-xl max-w-6xl w-full ${
          selectedUser ? 'h-screen md:h-[calc(100vh-8rem)] md:rounded-lg rounded-none' : 'h-[calc(100vh-8rem)]'
        }`}>
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* Sidebar - hide on mobile when user selected */}
            <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-auto`}>
              <Sidebar />
            </div>
            {/* Chat area - hide on mobile when no user selected */}
            <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} flex-1`}>
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;