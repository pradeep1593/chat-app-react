import { useEffect, useRef,useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";                                                                                                                   
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/useStore";
import upload from "../../lib/upload";
import Detail from "../detail/Detail";
const Chat = () => {
    const[chat, setChat] = useState();
    const[open, setOpen] = useState(false);
    const[text, setText] = useState(""); 
    const[img, setImg] = useState({
        file: null,
        url: "",
    });
    const[addMode,setAddMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const {currentUser} = useUserStore();
    const {chatId,user,isCurrentUserBlocked ,isReceiverBlocked} = useChatStore();
                                                                                                                                                               
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth"});
    },[chat]);

    useEffect(() => {
        const unSub = onSnapshot(doc(db,"chats",chatId), 
        (res) =>{
            setChat(res.data());
        }); 

        return () =>{
            unSub();
        };
    },[chatId]);

   

    const handleEmoji = e =>{
        setText((prev) => prev+e.emoji);
        setOpen(false);
    }
    const handleImg = e =>{
        if(e.target.files[0]){
            setImg({
                file:e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            });
        }   
    };

    const handleSend  = async () =>{
        if(text === "") return;
        setLoading(true);
        let imgUrl = null;
        try {

            if(img.file){
                imgUrl = await upload(img.file);
            }

            await updateDoc(doc(db,"chats",chatId),{
               messages: arrayUnion({
                id: new Date().getTime(),
                senderId: currentUser.id,
                text,
                createdAt: new Date(),
                ...(imgUrl && { img: imgUrl }),
               }),
            });

            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async (id) => { 

                const userChatsRef = doc(db,"userchats",id);
                const userChatsSnapshot = await getDoc(userChatsRef);
                if(userChatsSnapshot.exists()){
                    const userChatsData = userChatsSnapshot.data();

                    const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);
                    userChatsData.chats[chatIndex].lastMessage = text;
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.id? true : false;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();

                    await updateDoc(userChatsRef,{
                        chats: userChatsData.chats,
                    });
                }
            });
        } catch (err) {
            console.log("Error sending message:" ,err);
        }finally{
            setLoading(false);
            setImg({ file:null, url:""});
            setText("");
        }
    };
    const formatDate = (date) => {
        return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    };
    
    return(
        <div className="chat-container"> 
        <div className="chat-section">
        <div className='chat'>
            <div className="top">
                <div className="user">
                   <img src={user?.avatar || "./avatar.png"} alt=""/>
                   <div className="texts">
                    <span >{user?.username}</span>
                    <p>you have nothing to loose</p>
                   </div>
                </div>
                <div className="icons">
                    
                    <img src={addMode ? "./info.png" : "./info.png" }
                    onClick={() => setAddMode((prev) => !prev)}/>
                    
                </div> 
            </div>
            <div className="center">
            
                {chat?.messages?.map((message ,index) => {
                    
                     const messageDate = message.createdAt.toDate();
                    const formattedDate = formatDate(messageDate);

                    const messageTime = message.createdAt?.toDate();
                    const formattedTime = messageTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                     
                    const previousMessageDate = index > 0 ? chat.messages[index - 1].createdAt.toDate() : null;
                    const showDate = !previousMessageDate || formattedDate !== formatDate(previousMessageDate);
                    const messageKey = `${message.senderId}-${message.createdAt}`;
                    return ( 
                        <div key={messageKey} className="date">
                            {showDate && (
                                <div className="date-separator">
                                    <span>{formattedDate}</span>
                                </div>
                            )}
                            <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={messageKey}>
                            
                             
                                <div className="texts">
                                    {message.img && <img src={message.img} alt=""/>}
                                    <p>{message.text}</p>
                                    <span>{formattedTime}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {img.url && (
                    <div className="message own">
                        <div className="texts">
                            <img src={img.url} alt=""/>
                        </div>
                    </div>
                )}

               <div ref={endRef}></div>

            </div>

            <div className="bottom">
                
                    
                <div className="icons">
                    <div className="emoji">
                        <img src="./emoji.png"  alt="" height="35" width="35"
                        onClick={() => setOpen((prev) => !prev)}/>
                        <div className="picker">
                            {open && <EmojiPicker  onEmojiClick={handleEmoji}/>}
                        </div>
                        
                    </div>
                    <label htmlFor="file">
                    <img src="./img.png"  alt="" height="35" width="35"/>
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleImg}/>
                    
                
                </div>
                <input type="text" placeholder={isCurrentUserBlocked || isReceiverBlocked ? "you can't send  message" : "Type a message..." }
                value = {text}
                onChange={e=>setText(e.target.value)}
                disabled={isCurrentUserBlocked || isReceiverBlocked} />
               
                <button className="sendButton" onClick={handleSend} disabled={loading || isCurrentUserBlocked || isReceiverBlocked}>{loading ? "Sending..." : "Send"}</button>
            </div>
            </div>
            </div>
            {addMode&& (
                <div className="detail-section"> 
                    <Detail />
                </div>)}
        </div>
    )
}
export default Chat;
