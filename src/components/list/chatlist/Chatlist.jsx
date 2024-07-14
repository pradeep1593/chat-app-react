import { useEffect, useState } from "react";
import "./chatlist.css";
import AddUser from "./addUser/addUser";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useUserStore } from "../../../lib/useStore";
import { useChatStore } from "../../../lib/chatStore";

const Chatlist = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      if (!res.exists()) {
        console.log("No such document!"); // Handle case where document doesn't exist
        setChats([]);
        return;
      }

      const data = res.data();
      if (!data || !data.chats) {
        // console.log("No chats found!"); // Handle case where chats array is null or undefined
        setChats([]);
        return;
      }

      const items = data.chats;

      try {
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          if (!userDocSnap.exists()) {
            console.log(`User document not found for receiverId: ${item.receiverId}`);
            return null; // Handle if user document doesn't exist
          }

          const user = userDocSnap.data();
          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        const filteredChatData = chatData.filter((chat) => chat !== null);

        // Sort by updatedAt in descending order
        filteredChatData.sort((a, b) => b.updatedAt - a.updatedAt);

        setChats(filteredChatData);
      } catch (error) {
        console.error("Error fetching and transforming chat data:", error);
      }
    });

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => ({ ...item, isSeen: item.chatId === chat.chatId }));

    const userChatsRef = doc(db, "userchats", currentUser.id);
    try {
      await updateDoc(userChatsRef, { chats: userChats });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.error("Error updating user chats:", err);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatlist">
      <div className="search">
        <div className="searchbar">
          <input
            type="text"
            placeholder="Search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <img src="./search.png" alt="Search icon" />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          className="add"
          alt="Add icon"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt="User avatar"
          />
          <div className="texts">
            <span>{chat.user.username}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {addMode && <AddUser />}
    </div>
  );
};

export default Chatlist;
