 
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import  "./addUser.css";
import { useState } from "react";
import { db } from "../../../../lib/firebase";
import { useUserStore } from "../../../../lib/useStore";

const AddUser = () => {

  const [user,setUser] = useState(null);

  const {currentUser} = useUserStore();
   
  const handleSearch = async (e) => {

    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");

      // Create a query against the collection.
      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);

      if(!querySnapShot.empty){
        setUser(querySnapShot.docs[0].data());
      }else{
        setUser(null);
      }
    } catch (err) {
      console.log(err); 
    }
  };

  const  handleAdd  = async ()=>{
    
    const userChatsRef = collection(db, "userchats");
    try {
      const chatRef = collection(db, "chats");
      const newChatRef  = doc(chatRef);
      console.log('Document reference created:', newChatRef.path);

      await setDoc(newChatRef,{
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id),{
        chats:arrayUnion({
          chatId: newChatRef.id,
          lastMessage:"",
          receiverId:  currentUser.id,
          updatedAt: Date.now(),
        })
      })
      await updateDoc(doc(userChatsRef, currentUser.id),{
        chats:arrayUnion({
          chatId: newChatRef.id,
          lastMessage:"",
          receiverId:  user.id,
          updatedAt: Date.now(),
        })
      })
      //console.log(newChatRef.id);
      
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="addUser">
        <form action="" onSubmit={handleSearch}>
          <input type="text" placeholder="Username" name="username"/>
          <button type="submit">Search</button>
        </form>

        {user && <div className="user"> 
            <div className="detail">
                <img src={user.avatar || "./avatar.png"} alt="" />
                <span>{user.username}</span>
            </div>
            <button onClick={handleAdd}>Add User</button>
          </div>
        }
    </div>
  );
};

export default AddUser;